//! Implementation of a Merkle tree of commitments used to prove the existence of notes.

use byteorder::{LittleEndian, ReadBytesExt};
use std::collections::VecDeque;
use std::io::{self, Read, Write};

use incrementalmerkletree::{self, bridgetree};
use zcash_encoding::{Optional, Vector};
use zcash_primitives::{
    merkle_tree::Hashable,
    sapling::{SAPLING_COMMITMENT_TREE_DEPTH, SAPLING_COMMITMENT_TREE_DEPTH_U8},
};
struct PathFiller<Node: Hashable> {
    queue: VecDeque<Node>,
}

impl<Node: Hashable> PathFiller<Node> {
    fn empty() -> Self {
        PathFiller {
            queue: VecDeque::new(),
        }
    }

    fn next(&mut self, depth: usize) -> Node {
        self.queue
            .pop_front()
            .unwrap_or_else(|| Node::empty_root(depth))
    }
}

/// A Merkle tree of note commitments.
///
/// The depth of the Merkle tree is fixed at 32, equal to the depth of the Sapling
/// commitment tree.
#[derive(Clone, Debug)]
pub struct CommitmentTree<Node> {
    pub(crate) left: Option<Node>,
    pub(crate) right: Option<Node>,
    pub(crate) parents: Vec<Option<Node>>,
}

impl<Node> CommitmentTree<Node> {
    /// Creates an empty tree.
    pub fn empty() -> Self {
        CommitmentTree {
            left: None,
            right: None,
            parents: vec![],
        }
    }

    pub fn to_frontier(&self) -> bridgetree::Frontier<Node, SAPLING_COMMITMENT_TREE_DEPTH_U8>
    where
        Node: incrementalmerkletree::Hashable + Clone,
    {
        if self.size() == 0 {
            bridgetree::Frontier::empty()
        } else {
            let leaf = match (self.left.as_ref(), self.right.as_ref()) {
                (Some(a), None) => bridgetree::Leaf::Left(a.clone()),
                (Some(a), Some(b)) => bridgetree::Leaf::Right(a.clone(), b.clone()),
                _ => unreachable!(),
            };

            let ommers = self
                .parents
                .iter()
                .filter_map(|v| v.as_ref())
                .cloned()
                .collect();

            // If a frontier cannot be successfully constructed from the
            // parts of a commitment tree, it is a programming error.
            bridgetree::Frontier::from_parts((self.size() - 1).into(), leaf, ommers)
                .expect("Frontier should be constructable from CommitmentTree.")
        }
    }

    /// Returns the number of leaf nodes in the tree.
    pub fn size(&self) -> usize {
        self.parents.iter().enumerate().fold(
            match (self.left.as_ref(), self.right.as_ref()) {
                (None, None) => 0,
                (Some(_), None) => 1,
                (Some(_), Some(_)) => 2,
                (None, Some(_)) => unreachable!(),
            },
            |acc, (i, p)| {
                // Treat occupation of parents array as a binary number
                // (right-shifted by 1)
                acc + if p.is_some() { 1 << (i + 1) } else { 0 }
            },
        )
    }

    fn is_complete(&self, depth: usize) -> bool {
        self.left.is_some()
            && self.right.is_some()
            && self.parents.len() == depth - 1
            && self.parents.iter().all(|p| p.is_some())
    }
}

impl<Node: Hashable> CommitmentTree<Node> {
    /// Reads a `CommitmentTree` from its serialized form.
    pub fn read<R: Read>(mut reader: R) -> io::Result<Self> {
        let left = Optional::read(&mut reader, Node::read)?;
        let right = Optional::read(&mut reader, Node::read)?;
        let parents = Vector::read(&mut reader, |r| Optional::read(r, Node::read))?;

        Ok(CommitmentTree {
            left,
            right,
            parents,
        })
    }

    /// Serializes this tree as an array of bytes.
    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        Optional::write(&mut writer, self.left, |w, n| n.write(w))?;
        Optional::write(&mut writer, self.right, |w, n| n.write(w))?;
        Vector::write(&mut writer, &self.parents, |w, e| {
            Optional::write(w, *e, |w, n| n.write(w))
        })
    }

    /// Adds a leaf node to the tree.
    ///
    /// Returns an error if the tree is full.
    pub fn append(&mut self, node: Node) -> Result<(), ()> {
        self.append_inner(node, SAPLING_COMMITMENT_TREE_DEPTH)
    }

    fn append_inner(&mut self, node: Node, depth: usize) -> Result<(), ()> {
        if self.is_complete(depth) {
            // Tree is full
            return Err(());
        }

        match (self.left, self.right) {
            (None, _) => self.left = Some(node),
            (_, None) => self.right = Some(node),
            (Some(l), Some(r)) => {
                let mut combined = Node::combine(0, &l, &r);
                self.left = Some(node);
                self.right = None;

                for i in 0..depth {
                    if i < self.parents.len() {
                        if let Some(p) = self.parents[i] {
                            combined = Node::combine(i + 1, &p, &combined);
                            self.parents[i] = None;
                        } else {
                            self.parents[i] = Some(combined);
                            break;
                        }
                    } else {
                        self.parents.push(Some(combined));
                        break;
                    }
                }
            }
        }

        Ok(())
    }

    /// Returns the current root of the tree.
    pub fn root(&self) -> Node {
        self.root_inner(SAPLING_COMMITMENT_TREE_DEPTH, PathFiller::empty())
    }

    fn root_inner(&self, depth: usize, mut filler: PathFiller<Node>) -> Node {
        assert!(depth > 0);

        // 1) Hash left and right leaves together.
        //    - Empty leaves are used as needed.
        let leaf_root = Node::combine(
            0,
            &self.left.unwrap_or_else(|| filler.next(0)),
            &self.right.unwrap_or_else(|| filler.next(0)),
        );

        // 2) Hash in parents up to the currently-filled depth.
        //    - Roots of the empty subtrees are used as needed.
        let mid_root = self
            .parents
            .iter()
            .enumerate()
            .fold(leaf_root, |root, (i, p)| match p {
                Some(node) => Node::combine(i + 1, node, &root),
                None => Node::combine(i + 1, &root, &filler.next(i + 1)),
            });

        // 3) Hash in roots of the empty subtrees up to the final depth.
        ((self.parents.len() + 1)..depth)
            .fold(mid_root, |root, d| Node::combine(d, &root, &filler.next(d)))
    }
}

/// An updatable witness to a path from a position in a particular [`CommitmentTree`].
///
/// Appending the same commitments in the same order to both the original
/// [`CommitmentTree`] and this `IncrementalWitness` will result in a witness to the path
/// from the target position to the root of the updated tree.
///
/// # Examples
///
/// ```
/// use ff::{Field, PrimeField};
/// use rand_core::OsRng;
/// use zcash_primitives::{
///     merkle_tree::{CommitmentTree, IncrementalWitness},
///     sapling::Node,
/// };
///
/// let mut rng = OsRng;
///
/// let mut tree = CommitmentTree::<Node>::empty();
///
/// tree.append(Node::new(bls12_381::Scalar::random(&mut rng).to_repr()));
/// tree.append(Node::new(bls12_381::Scalar::random(&mut rng).to_repr()));
/// let mut witness = IncrementalWitness::from_tree(&tree);
/// assert_eq!(witness.position(), 1);
/// assert_eq!(tree.root(), witness.root());
///
/// let cmu = Node::new(bls12_381::Scalar::random(&mut rng).to_repr());
/// tree.append(cmu);
/// witness.append(cmu);
/// assert_eq!(tree.root(), witness.root());
/// ```
#[derive(Clone)]
pub struct IncrementalWitness<Node: Hashable> {
    tree: CommitmentTree<Node>,
    filled: Vec<Node>,
    cursor_depth: usize,
    cursor: Option<CommitmentTree<Node>>,
}

impl<Node: Hashable> IncrementalWitness<Node> {
    /// Creates an `IncrementalWitness` for the most recent commitment added to the given
    /// [`CommitmentTree`].
    pub fn from_tree(tree: &CommitmentTree<Node>) -> IncrementalWitness<Node> {
        IncrementalWitness {
            tree: tree.clone(),
            filled: vec![],
            cursor_depth: 0,
            cursor: None,
        }
    }

    /// Reads an `IncrementalWitness` from its serialized form.
    #[allow(clippy::redundant_closure)]
    pub fn read<R: Read>(mut reader: R) -> io::Result<Self> {
        let tree = CommitmentTree::read(&mut reader)?;
        let filled = Vector::read(&mut reader, |r| Node::read(r))?;
        let cursor = Optional::read(&mut reader, CommitmentTree::read)?;

        let mut witness = IncrementalWitness {
            tree,
            filled,
            cursor_depth: 0,
            cursor,
        };

        witness.cursor_depth = witness.next_depth();

        Ok(witness)
    }

    /// Serializes this `IncrementalWitness` as an array of bytes.
    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        self.tree.write(&mut writer)?;
        Vector::write(&mut writer, &self.filled, |w, n| n.write(w))?;
        Optional::write(&mut writer, self.cursor.as_ref(), |w, t| t.write(w))
    }

    /// Returns the position of the witnessed leaf node in the commitment tree.
    pub fn position(&self) -> usize {
        self.tree.size() - 1
    }

    fn filler(&self) -> PathFiller<Node> {
        let cursor_root = self
            .cursor
            .as_ref()
            .map(|c| c.root_inner(self.cursor_depth, PathFiller::empty()));

        PathFiller {
            queue: self.filled.iter().cloned().chain(cursor_root).collect(),
        }
    }

    /// Finds the next "depth" of an unfilled subtree.
    fn next_depth(&self) -> usize {
        let mut skip = self.filled.len();

        if self.tree.left.is_none() {
            if skip > 0 {
                skip -= 1;
            } else {
                return 0;
            }
        }

        if self.tree.right.is_none() {
            if skip > 0 {
                skip -= 1;
            } else {
                return 0;
            }
        }

        let mut d = 1;
        for p in &self.tree.parents {
            if p.is_none() {
                if skip > 0 {
                    skip -= 1;
                } else {
                    return d;
                }
            }
            d += 1;
        }

        d + skip
    }

    /// Tracks a leaf node that has been added to the underlying tree.
    ///
    /// Returns an error if the tree is full.
    pub fn append(&mut self, node: Node) -> Result<(), ()> {
        self.append_inner(node, SAPLING_COMMITMENT_TREE_DEPTH)
    }

    fn append_inner(&mut self, node: Node, depth: usize) -> Result<(), ()> {
        if let Some(mut cursor) = self.cursor.take() {
            cursor
                .append_inner(node, depth)
                .expect("cursor should not be full");
            if cursor.is_complete(self.cursor_depth) {
                self.filled
                    .push(cursor.root_inner(self.cursor_depth, PathFiller::empty()));
            } else {
                self.cursor = Some(cursor);
            }
        } else {
            self.cursor_depth = self.next_depth();
            if self.cursor_depth >= depth {
                // Tree is full
                return Err(());
            }

            if self.cursor_depth == 0 {
                self.filled.push(node);
            } else {
                let mut cursor = CommitmentTree::empty();
                cursor
                    .append_inner(node, depth)
                    .expect("cursor should not be full");
                self.cursor = Some(cursor);
            }
        }

        Ok(())
    }

    /// Returns the current root of the tree corresponding to the witness.
    pub fn root(&self) -> Node {
        self.root_inner(SAPLING_COMMITMENT_TREE_DEPTH)
    }

    fn root_inner(&self, depth: usize) -> Node {
        self.tree.root_inner(depth, self.filler())
    }

    /// Returns the current witness, or None if the tree is empty.
    pub fn path(&self) -> Option<MerklePath<Node>> {
        self.path_inner(SAPLING_COMMITMENT_TREE_DEPTH)
    }

    fn path_inner(&self, depth: usize) -> Option<MerklePath<Node>> {
        let mut filler = self.filler();
        let mut auth_path = Vec::new();

        if let Some(node) = self.tree.left {
            if self.tree.right.is_some() {
                auth_path.push((node, true));
            } else {
                auth_path.push((filler.next(0), false));
            }
        } else {
            // Can't create an authentication path for the beginning of the tree
            return None;
        }

        for (i, p) in self.tree.parents.iter().enumerate() {
            auth_path.push(match p {
                Some(node) => (*node, true),
                None => (filler.next(i + 1), false),
            });
        }

        for i in self.tree.parents.len()..(depth - 1) {
            auth_path.push((filler.next(i + 1), false));
        }
        assert_eq!(auth_path.len(), depth);

        Some(MerklePath::from_path(auth_path, self.position() as u64))
    }
}

/// A path from a position in a particular commitment tree to the root of that tree.
#[derive(Clone, Debug, PartialEq)]
pub struct MerklePath<Node: Hashable> {
    pub auth_path: Vec<(Node, bool)>,
    pub position: u64,
}

impl<Node: Hashable> MerklePath<Node> {
    /// Constructs a Merkle path directly from a path and position.
    pub fn from_path(auth_path: Vec<(Node, bool)>, position: u64) -> Self {
        MerklePath {
            auth_path,
            position,
        }
    }

    /// Reads a Merkle path from its serialized form.
    pub fn from_slice(witness: &[u8]) -> Result<Self, ()> {
        Self::from_slice_with_depth(witness, SAPLING_COMMITMENT_TREE_DEPTH)
    }

    fn from_slice_with_depth(mut witness: &[u8], depth: usize) -> Result<Self, ()> {
        // Skip the first byte, which should be "depth" to signify the length of
        // the following vector of Pedersen hashes.
        if witness[0] != depth as u8 {
            return Err(());
        }
        witness = &witness[1..];

        // Begin to construct the authentication path
        let iter = witness.chunks_exact(33);
        witness = iter.remainder();

        // The vector works in reverse
        let mut auth_path = iter
            .rev()
            .map(|bytes| {
                // Length of inner vector should be the length of a Pedersen hash
                if bytes[0] == 32 {
                    // Sibling node should be an element of Fr
                    Node::read(&bytes[1..])
                        .map(|sibling| {
                            // Set the value in the auth path; we put false here
                            // for now (signifying the position bit) which we'll
                            // fill in later.
                            (sibling, false)
                        })
                        .map_err(|_| ())
                } else {
                    Err(())
                }
            })
            .collect::<Result<Vec<_>, _>>()?;
        if auth_path.len() != depth {
            return Err(());
        }

        // Read the position from the witness
        let position = witness.read_u64::<LittleEndian>().map_err(|_| ())?;

        // Given the position, let's finish constructing the authentication
        // path
        let mut tmp = position;
        for entry in auth_path.iter_mut() {
            entry.1 = (tmp & 1) == 1;
            tmp >>= 1;
        }

        // The witness should be empty now; if it wasn't, the caller would
        // have provided more information than they should have, indicating
        // a bug downstream
        if witness.is_empty() {
            Ok(MerklePath {
                auth_path,
                position,
            })
        } else {
            Err(())
        }
    }

    /// Returns the root of the tree corresponding to this path applied to `leaf`.
    pub fn root(&self, leaf: Node) -> Node {
        self.auth_path
            .iter()
            .enumerate()
            .fold(
                leaf,
                |root, (i, (p, leaf_is_on_right))| match leaf_is_on_right {
                    false => Node::combine(i, &root, p),
                    true => Node::combine(i, p, &root),
                },
            )
    }
}

#[cfg(test)]
mod tests {
    use super::{CommitmentTree, Hashable, IncrementalWitness, MerklePath, PathFiller};
    use crate::sapling::Node;

    use std::convert::TryInto;
    use std::io::{self, Read, Write};

    const HEX_EMPTY_ROOTS: [&str; 33] = [
        "0100000000000000000000000000000000000000000000000000000000000000",
        "325aea4964041359acb6d15fa724089dd7242a7a61b1d9db50983e402d88ff1d",
        "6772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a10220",
        "39cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e",
        "3aa41a68aac5b5e125616c1c4efb4a00e08ca4f8e65e66a1470d7c47c72a140f",
        "5b5714543c02aa922a6620e12e901943fc5b03bb9ae1586c002d639570326707",
        "4c66cea9b58243efbe2e62d1da3a03a48cfbce68ef212b3c77acb1e12c5ab962",
        "4e8e59d04c3f4469e9d58483fc8539db868cf2334f4257121ad6f80db6c9702d",
        "806ab1a3c089454e16575ceece1e3aefee2a6184255e18a2343fb7feb86b7e6d",
        "798e3416956611fa66571e10e50b8b2c0abf537f16afc725ced4ece6b2791424",
        "3ea72374fe684e6a8eb5d4980633218da196cab396fcdddf6831953298f3e455",
        "2cd2e15a6e521b4ff874c7261fcba80b7782526f236bf73435ce20eb136d4c33",
        "9eed88e4f9bb67d455f9aebdb6ab4ef8b566b03f230804c7f58214043bd4e471",
        "48917eaa9b4c094d69ec54970475d3df466a984ee9aed707970c69bc958f6e61",
        "3a6ac56a4149e8c9bd8119e3ab6fa7780bda6fc14d6119c416a11a1bc1c0b60d",
        "b93879c9b8476d6b3952933c83a07ac6aeeb01f6bc971b6740da7614a47da958",
        "8934595bab6108f9b2e6fa75d4e1d285eb79791c5e7610358acd626a4b170221",
        "dd0e078b30ad16780690abae311be0130c2a9a030d0d65c8f12aec3264ed853b",
        "6ed767be9c66da7d6f7eba511871d9da61456026b7f310e15e3359ac41ec9260",
        "49c2d8eff3e9c0a5a2017de57ab4e2c12eea2cf06228127f26580f4fa9af5623",
        "897423682b6d8f56fce75bf9c4a7f70f35dfa7386e554e7c561a62a835c3a366",
        "2d7708b49a8ab745c2f51f638649c6a455842a6f4e040aae4d98855463372459",
        "d88bbcd3447046ef164ce336bdb9d6d29f4367d2f8aa7d39644e87c9c1ecca05",
        "b522e12ee1a1aa449be27411bbf4f8bdf90a8a816b7144f28991fa307644541b",
        "4147f5d495d644e9c246093bdba51a94d44de39bb435f3410b52969570babe6d",
        "4b07ba48cb4a793c01dfeb6392195b6493f3ceed52b5cea7df7279220e967e47",
        "3b52fb113249110b4566887d79a9693c3be69572a5b90b690702066e97ef155c",
        "a5461d4e8bd352703204beb6277e50a2c27e7779f7ab98fd45ceb0bba5c1b901",
        "8ef64e2cbb03d5af593244b253abc3e94db3b9150596e17303940d4eb2d5781a",
        "89fd643bbfeef5b486e4e29e1c99d72c29944791c32fc225396b59318681b633",
        "ad15f9b7057e4431f40b17d3cc76194d8339b1ddd9d80b20352002634663642e",
        "de43f9cb72ec5b01c93aff1981a6cb7765b3e0c60ecdd4f0ddc1f1dda252ff0e",
        "2d924d748574cf8b52f92b40d84f3781c8036defd40bc688ea182b1e52e8bf32",
    ];

    const TESTING_DEPTH: usize = 4;

    struct TestCommitmentTree(CommitmentTree<Node>);

    impl TestCommitmentTree {
        fn new() -> Self {
            TestCommitmentTree(CommitmentTree::empty())
        }

        pub fn read<R: Read>(reader: R) -> io::Result<Self> {
            let tree = CommitmentTree::read(reader)?;
            Ok(TestCommitmentTree(tree))
        }

        pub fn write<W: Write>(&self, writer: W) -> io::Result<()> {
            self.0.write(writer)
        }

        fn size(&self) -> usize {
            self.0.size()
        }

        fn append(&mut self, node: Node) -> Result<(), ()> {
            self.0.append_inner(node, TESTING_DEPTH)
        }

        fn root(&self) -> Node {
            self.0.root_inner(TESTING_DEPTH, PathFiller::empty())
        }
    }

    struct TestIncrementalWitness(IncrementalWitness<Node>);

    impl TestIncrementalWitness {
        fn from_tree(tree: &TestCommitmentTree) -> Self {
            TestIncrementalWitness(IncrementalWitness::from_tree(&tree.0))
        }

        pub fn read<R: Read>(reader: R) -> io::Result<Self> {
            let witness = IncrementalWitness::read(reader)?;
            Ok(TestIncrementalWitness(witness))
        }

        pub fn write<W: Write>(&self, writer: W) -> io::Result<()> {
            self.0.write(writer)
        }

        fn append(&mut self, node: Node) -> Result<(), ()> {
            self.0.append_inner(node, TESTING_DEPTH)
        }

        fn root(&self) -> Node {
            self.0.root_inner(TESTING_DEPTH)
        }

        fn path(&self) -> Option<MerklePath<Node>> {
            self.0.path_inner(TESTING_DEPTH)
        }
    }

    #[test]
    fn empty_root_test_vectors() {
        let mut tmp = [0u8; 32];
        for (i, &expected) in HEX_EMPTY_ROOTS.iter().enumerate() {
            Node::empty_root(i)
                .write(&mut tmp[..])
                .expect("length is 32 bytes");
            assert_eq!(hex::encode(tmp), expected);
        }
    }

    #[test]
    fn sapling_empty_root() {
        let mut tmp = [0u8; 32];
        CommitmentTree::<Node>::empty()
            .root()
            .write(&mut tmp[..])
            .expect("length is 32 bytes");
        assert_eq!(
            hex::encode(tmp),
            "2d924d748574cf8b52f92b40d84f3781c8036defd40bc688ea182b1e52e8bf32"
        );
    }

    #[test]
    fn empty_commitment_tree_roots() {
        let tree = CommitmentTree::<Node>::empty();
        let mut tmp = [0u8; 32];
        for (i, &expected) in HEX_EMPTY_ROOTS.iter().enumerate().skip(1) {
            tree.root_inner(i, PathFiller::empty())
                .write(&mut tmp[..])
                .expect("length is 32 bytes");
            assert_eq!(hex::encode(tmp), expected);
        }
    }

    #[test]
    fn test_sapling_tree() {
        // From https://github.com/zcash/zcash/blob/master/src/test/data/merkle_commitments_sapling.json
        // Byte-reversed because the original test vectors are loaded using uint256S()
        let commitments = [
            "b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55",
            "225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458",
            "7c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c",
            "50421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a030",
            "aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc12",
            "f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02",
            "bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e",
            "da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a511",
            "3a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f77446",
            "c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008",
            "f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702",
            "e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c608",
            "8cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826",
            "22fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c03",
            "f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c",
            "3a3661bc12b72646c94bc6c92796e81953985ee62d80a9ec3645a9a95740ac15",
        ];

        // From https://github.com/zcash/zcash/blob/master/src/test/data/merkle_roots_sapling.json
        let roots = [
            "a270673e2aa93c39cbdc51f8db016069fb3820cef02d9d356f4f10eefc270e47",
            "1c23b09efb46ebc1fec5e3491f7aea2f0a032e75896cab4fab0265406c468055",
            "167ecc77594eb9f25d9ab2a5bcbbc62816ef74dca74a6cf417cc7cca9d313d50",
            "6585cbd8e3511fdd47ab0cc9f531d6d25ab5287f83d9e0da8d45c97ef5c41400",
            "61e07624df25c9181cd5bced25be80b66789db27d301048e459af72fb1495447",
            "bce76aba9d1cd65cdce1265132a90258edd62c2fcb7c010756f2eaf66ac71426",
            "2f03572a2aec981c66ea328c55df41e805ab10203d1ae367e0607218819c7914",
            "c95a05519cf0e88910384cbb83c6a2ccbb3db91520c0fbc81dabcafd2281c706",
            "0401e1b37f74a092627b1cfc439b17645cdf8750dd121ff6e343a2f2d4c70750",
            "76b52af6b4c127c877c9628fd547c0adc9c89aa3a9439c818d5f643d0cdf7361",
            "9dfaaeb44e192d45d520aef14c80edc4f66e149e90dcc8d16e9356248b996206",
            "c746fc1932d2d96c60ba5c9e9f22bbb14c53a10bda4fb44bdd6f6d176466b03f",
            "97a8f4156262e4bbd6e2a98a21e73cf366a3ece9a980f6fbbc495abe2268bb4e",
            "5f1ea80530b7f4301f95bddd5c1ccc60866d5ef6c8fd78b4fdebd9de4aedbd07",
            "c6c80b1f3e2aa71e26b03753d3f6cf12e59da285645829b11799eb49f4842632",
            "cc9eac5736ad2820e7a7b487d85d43c7b298024d0f7c8386998895eeb6dad061",
        ];

        // From https://github.com/zcash/zcash/blob/master/src/test/data/merkle_serialization_sapling.json
        let tree_ser = [
            "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550000",
            "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b1145800",
            "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32",
            "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32",
            "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546",
            "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546",
            "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546",
            "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546",
            "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "01f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000301897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
            "01f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c013a3661bc12b72646c94bc6c92796e81953985ee62d80a9ec3645a9a95740ac150301897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867",
        ];

        // From https://github.com/zcash/zcash/blob/master/src/test/data/merkle_path_sapling.json
        let paths = [
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020325aea4964041359acb6d15fa724089dd7242a7a61b1d9db50983e402d88ff1d20225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020f639aa2c571635f610868374397f7550e15d9f3d259ed4631e435a2bbb76b65020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020f639aa2c571635f610868374397f7550e15d9f3d259ed4631e435a2bbb76b65020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20d4a8c3b69916717c2ed7d898582c7e51239879de273c338c82515a858ac6fa6020f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20d4a8c3b69916717c2ed7d898582c7e51239879de273c338c82515a858ac6fa6020f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20d4a8c3b69916717c2ed7d898582c7e51239879de273c338c82515a858ac6fa6020e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20d4a8c3b69916717c2ed7d898582c7e51239879de273c338c82515a858ac6fa6020e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206f0760a9f8310ef4c7cb7d3f46c6d5e1a5078f4be7c1e1887cf3e6a118937e6220f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206f0760a9f8310ef4c7cb7d3f46c6d5e1a5078f4be7c1e1887cf3e6a118937e6220f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206f0760a9f8310ef4c7cb7d3f46c6d5e1a5078f4be7c1e1887cf3e6a118937e6220e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e206f0760a9f8310ef4c7cb7d3f46c6d5e1a5078f4be7c1e1887cf3e6a118937e6220e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620325aea4964041359acb6d15fa724089dd7242a7a61b1d9db50983e402d88ff1d20f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e209e9b74b3ea00d9b37d6cbb8f66fe89a02bd2c49400a39525e9ef7fda6d725e2b20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e209e9b74b3ea00d9b37d6cbb8f66fe89a02bd2c49400a39525e9ef7fda6d725e2b20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e209e9b74b3ea00d9b37d6cbb8f66fe89a02bd2c49400a39525e9ef7fda6d725e2b20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e209e9b74b3ea00d9b37d6cbb8f66fe89a02bd2c49400a39525e9ef7fda6d725e2b20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620435c419ebde5aee180a7b11fb498c927988991814f1b9636605d2f150ea8a60c20f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620435c419ebde5aee180a7b11fb498c927988991814f1b9636605d2f150ea8a60c20aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "042039cf8d1399cea0bbb22c31ff1ed14be62acb70e75f13aa0757c29d76b943a53e20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c84416204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c84416204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c84416204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c84416204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c8441620c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c8441620c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c8441620c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "042086931326dffe2c2cf7c5c9c35caf4a7034c8004da5ba1e9ffd4b4457e2c8441620c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "04202e23901ceceef16bdb8612de22b7841b355525e39890e268c187f178ac6e1c1b20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020325aea4964041359acb6d15fa724089dd7242a7a61b1d9db50983e402d88ff1d20c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c68204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c68204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c68204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c68204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c6820c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c6820c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c6820c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "04208563c255cad5d730f866131878f89176ea1945d0cd1c1c7ad509459a5f687c6820c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a10220206696a59c37b77a46cec106a688812192bc82a8fcb70fc31e5a23079f68b0cc6520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a10220206696a59c37b77a46cec106a688812192bc82a8fcb70fc31e5a23079f68b0cc65203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb69204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb69204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb69204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb69204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb6920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb6920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb6920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "042002c351e2116514078254674c07c27c5282267c678a52ee5d594fabdfd64ceb6920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc05203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867206772ffd2b185aac6d10dc02551d9de9e7094b5548e9e13a833da8dc477a1022020fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080a00000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "0420b45d28cfe35167915168367f34218018e77b8783941d7077224cccbeee63b80d20c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867203020e91d176d492c907111ff18529a05273f085c6816ec678d2ab0222139473320d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867203020e91d176d492c907111ff18529a05273f085c6816ec678d2ab0222139473320d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc05203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867203020e91d176d492c907111ff18529a05273f085c6816ec678d2ab0222139473320fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080a00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867203020e91d176d492c907111ff18529a05273f085c6816ec678d2ab0222139473320fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020b00000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a19204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a19204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a19204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a19204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a1920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a1920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a1920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "04202db75629ee387a56a721c536fd47d7706a1c2a25c0b43a52efa7ea1685564a1920c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867204d3c1af83be9124b9a7efcb69c93c83df0e818f4f3dbab5ad6035dcdaa0e884f20d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867204d3c1af83be9124b9a7efcb69c93c83df0e818f4f3dbab5ad6035dcdaa0e884f20d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc05203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867204d3c1af83be9124b9a7efcb69c93c83df0e818f4f3dbab5ad6035dcdaa0e884f20fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080a00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867204d3c1af83be9124b9a7efcb69c93c83df0e818f4f3dbab5ad6035dcdaa0e884f20fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020b00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33920325aea4964041359acb6d15fa724089dd7242a7a61b1d9db50983e402d88ff1d2022fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030c00000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f5847204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f5847204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f5847204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f5847204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f584720c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f584720c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f584720c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "042099c90d035270f4461450ba07cbb2d22127874a1a50124762efd75950f54f584720c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867201c920d2375b164208b552bbbf3be670ba8bb71d2953062dc312be00cb976ec4720d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867201c920d2375b164208b552bbbf3be670ba8bb71d2953062dc312be00cb976ec4720d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc05203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867201c920d2375b164208b552bbbf3be670ba8bb71d2953062dc312be00cb976ec4720fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080a00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867201c920d2375b164208b552bbbf3be670ba8bb71d2953062dc312be00cb976ec4720fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020b00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc3392088ec6a6fbd3b57fd9841482d18c85c6c0265ebfaa3ce878543e8098891759f1d2022fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030c00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc3392088ec6a6fbd3b57fd9841482d18c85c6c0265ebfaa3ce878543e8098891759f1d208cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260d00000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda565204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580000000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda565204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745020b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f550100000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda565204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e322050421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300200000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda565204cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c20e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32207c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0300000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56520c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020400000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56520c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854620c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57120aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120500000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56520c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110600000000000000",
            "0420a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56520c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546208411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1220bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0700000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258672011e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0020d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0520c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080800000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258672011e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0020d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc05203a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460900000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258672011e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0020fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080a00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258672011e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0020fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e4320f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020b00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33920f1e52e9dd784324156f4cb229367e927c27c3d38fbf497a8c1e65afa986b9f322022fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030c00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33920f1e52e9dd784324156f4cb229367e927c27c3d38fbf497a8c1e65afa986b9f32208cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260d00000000000000",
            "0420342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867209b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33920897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063203a3661bc12b72646c94bc6c92796e81953985ee62d80a9ec3645a9a95740ac150e00000000000000",
        ];

        // From https://github.com/zcash/zcash/blob/master/src/test/data/merkle_witness_serialization_sapling.json
        let witness_ser = ["00000001b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5500",
        "00000002b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b1145800",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000001225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b1145800",
        "00000002b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b1145801017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000001225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b1145801017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458000001017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0000",
        "00000003b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000002225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580001f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee745000",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a03000",
        "00000003b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000002225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580001f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120000",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120000",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32000101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc120000",
        "00000003b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000002225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580001f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32000101aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a0200",
        "00000003b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0001018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b12",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000002225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0001018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b12",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580001f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74500101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0001018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b12",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0001018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b12",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32000101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0001018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b12",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a020101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0000",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546000101bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0000",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c00",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c00",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c00",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c00",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c00",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57100",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57100",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51100",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e5585460001013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460000",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51101013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e5585460001013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300800",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546000101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f1630080101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020000",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867000101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c37020000",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546000101f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e43",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0500",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0500",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c60800",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e5585460001018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0501018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260000",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0501018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260000",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c60801018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260000",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670001018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260000",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c01018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf57101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51101018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e5585460001018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030200019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0501018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c0300",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0501018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c0300",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c60801018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c0300",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670001018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c0300",
        "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c0300",
        "00000004b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000003225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580002f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320250421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32014cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381c0101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf5710101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a5110101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e558546000101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000201897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc339",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc050101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000101897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc050101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000101897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000101897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867000101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000101897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063",
        "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c0000",
        "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867000101f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c0000",
        "00000005b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381ca85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f55000004225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b11458f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381ca85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01b02310f2e087e55bfd07ef5e242e3b87ee5d00c9ab52f61e6bd42542f93a6f5501225747f3b5d5dab4e5a424f81f85c904ff43286e0f3fd07ef0b8c6a627b114580003f65c8818d1e0780c7a19d6b58b4635905c693d8e84b8c3faae01ace409ee74504cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381ca85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c000101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e320350421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0304cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381ca85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "017c3ea01a6e3a3d90cf59cd789e467044b5cd78eb2c84cc6816f960746d0e036c0150421d6c2c94571dfaaa135a4ff15bf916681ebd62c0e43e69e3b90684d0a0300101e367549091d965282b7c537d000d727a43d2ad2c56e6dbae11097d85d0362e32024cf9be2d92ab7245fa3fe99f6a10b31979213668e1b45927791cee4f5c5a381ca85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1200020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854603f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf571a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01aaec63863aaa0b2e3b8009429bdddd455e59be6f40ccab887a32eb98723efc1201f76748d40d5ee5f9a608512e7954dd515f86e8f6d009141c89163de1cf351a02020001c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602c23d2e1952e2933114c415c19b37f6d6d10139ccf4ca3dc9058589202e2cf571a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e0002018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854602da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a511a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "01bc8a5ec71647415c380203b681f7717366f3501661512225b6dc3e121efc0b2e01da1adda2ccde9381e11151686c121e7f52d19a990439161c7eb5a9f94be5a51102018411a201ea467a927d0fa903674108ce8c6ffb5b66761152b1bc513aae248b1201c2ab42fc7f82ff1683a4fcc5733c3278efa574f5d4f500e030727b5a4e55854601a85db1d774b1fb8b6c883f251abefe355fe957792555f82c534e3b5ac7fda56500",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f774460003000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586703c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f163008d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0511e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0000",
        "013a27fed5dbbc475d3880360e38638c882fd9b273b618fc433106896083f7744601c7ca8f7df8fd997931d33985d935ee2d696856cc09cc516d419ea6365f16300803000001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702d3889914fa5644125452d857340137a865fe25e9a691f2f672aaec7c0212cc0511e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0000",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c3702000301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586702e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c60811e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0000",
        "01f0fa37e8063b139d342246142fc48e7c0c50d0a62c97768589e06466742c370201e6d4d7685894d01b32f7e081ab188930be6c2b9f76d6847b7f382e3dddd7c6080301fb23cf40b920e71fbc102e24f1e254ab94a5cd0777909d0be71ff77f9b736e430001342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670111e23dbafd050ee47108b8bd65e31f368f0464dc4c565fd188e9a5cf4e13fb0000",
        "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e826000300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e2258670222fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c03f1e52e9dd784324156f4cb229367e927c27c3d38fbf497a8c1e65afa986b9f3200",
        "018cebb73be883466d18d3b0c06990520e80b936440a2c9fd184d92a1f06c4e8260122fab8bcdb88154dbf5877ad1e2d7f1b541bc8a5ec1b52266095381339c27c030300019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e22586701f1e52e9dd784324156f4cb229367e927c27c3d38fbf497a8c1e65afa986b9f3200",
        "01f43e3aac61e5a753062d4d0508c26ceaf5e4c0c58ba3c956e104b5d2cf67c41c000301897c4d556be5693f038bc0db64fb02a8058bbdf49c7b223cdd838de0db18d063019b64d9eaba791462043329211f21bdd22ecbb61e5b6c453cf5d8a0be7f7dc33901342eb1bd2cbfc1f19aaf4b4651d3d08a2dfbe39536617bf6e969c6ce8e225867013a3661bc12b72646c94bc6c92796e81953985ee62d80a9ec3645a9a95740ac1500",
    ]
    ;

        fn assert_root_eq(root: Node, expected: &str) {
            let mut tmp = [0u8; 32];
            root.write(&mut tmp[..]).expect("length is 32 bytes");
            assert_eq!(hex::encode(tmp), expected);
        }

        fn assert_tree_ser_eq(tree: &TestCommitmentTree, expected: &str) {
            // Check that the tree matches its encoding
            let mut tmp = Vec::new();
            tree.write(&mut tmp).unwrap();
            assert_eq!(hex::encode(&tmp[..]), expected);

            // Check round-trip encoding
            let decoded = TestCommitmentTree::read(&hex::decode(expected).unwrap()[..]).unwrap();
            tmp.clear();
            decoded.write(&mut tmp).unwrap();
            assert_eq!(hex::encode(tmp), expected);
        }

        fn assert_witness_ser_eq(witness: &TestIncrementalWitness, expected: &str) {
            // Check that the witness matches its encoding
            let mut tmp = Vec::new();
            witness.write(&mut tmp).unwrap();
            assert_eq!(hex::encode(&tmp[..]), expected);

            // Check round-trip encoding
            let decoded =
                TestIncrementalWitness::read(&hex::decode(expected).unwrap()[..]).unwrap();
            tmp.clear();
            decoded.write(&mut tmp).unwrap();
            assert_eq!(hex::encode(tmp), expected);
        }
        #[allow(dead_code)]
        fn print_path_ser<Node: Hashable>(path: &MerklePath<Node>) {
            let mut tmp = vec![TESTING_DEPTH as u8];
            for node in path.auth_path.iter().rev() {
                tmp.push(32u8);
                node.0.write(&mut tmp).unwrap();
            }
            use byteorder::WriteBytesExt;
            tmp.write_u64::<byteorder::LittleEndian>(path.position)
                .unwrap();
            println!("{}", hex::encode(tmp));
        }
        #[allow(dead_code)]
        fn print_witness_ser(witness: &TestIncrementalWitness) {
            let mut tmp = Vec::new();
            witness.write(&mut tmp).unwrap();
            println!("{}", hex::encode(&tmp));
        }

        let mut tree = TestCommitmentTree::new();
        assert_eq!(tree.size(), 0);

        let mut witnesses = vec![];
        let mut last_cmu = None;
        let mut paths_i = 0;
        let mut witness_ser_i = 0;

        for i in 0..16 {
            let cmu = hex::decode(commitments[i]).unwrap();

            let cmu = Node::new(cmu[..].try_into().unwrap());

            // Witness here
            witnesses.push((TestIncrementalWitness::from_tree(&tree), last_cmu));

            // Now append a commitment to the tree
            assert!(tree.append(cmu).is_ok());

            // Size incremented by one.
            assert_eq!(tree.size(), i + 1);

            // Check tree root consistency
            assert_root_eq(tree.root(), roots[i]);

            // Check serialization of tree
            assert_tree_ser_eq(&tree, tree_ser[i]);

            for (witness, leaf) in witnesses.as_mut_slice() {
                // Append the same commitment to all the witnesses
                assert!(witness.append(cmu).is_ok());

                if let Some(leaf) = leaf {
                    let path = witness.path().expect("should be able to create a path");
                    let expected = MerklePath::from_slice_with_depth(
                        &hex::decode(paths[paths_i]).unwrap(),
                        TESTING_DEPTH,
                    )
                    .unwrap();
                    assert_eq!(path, expected);
                    assert_eq!(path.root(*leaf), witness.root());
                    paths_i += 1;
                } else {
                    // The first witness can never form a path
                    assert!(witness.path().is_none());
                }

                // Check witness serialization
                assert_witness_ser_eq(witness, witness_ser[witness_ser_i]);
                witness_ser_i += 1;

                assert_eq!(witness.root(), tree.root());
            }

            last_cmu = Some(cmu);
        }
        // Tree should be full now
        let node = Node::blank();
        assert!(tree.append(node).is_err());
        for (witness, _) in witnesses.as_mut_slice() {
            assert!(witness.append(node).is_err());
        }
    }
}
