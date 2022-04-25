use blake2b_simd::Params;
use borsh::maybestd::io::{Error, ErrorKind};
use borsh::BorshDeserialize;
use group::GroupEncoding;
use serde::de::{SeqAccess, Visitor};
use serde::ser::SerializeTuple;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::convert::TryInto;
use std::fmt;
use std::fmt::Debug;
use std::marker::PhantomData;

use crate::{consensus, consensus::NetworkUpgrade};
use zcash_primitives::sapling::Rseed;
use ff::Field;
use rand_core::{CryptoRng, RngCore};

pub fn hash_to_scalar(persona: &[u8], a: &[u8], b: &[u8]) -> jubjub::Fr {
    let mut hasher = Params::new().hash_length(64).personal(persona).to_state();
    hasher.update(a);
    hasher.update(b);
    let ret = hasher.finalize();
    jubjub::Fr::from_bytes_wide(ret.as_array())
}

pub fn generate_random_rseed<P: consensus::Parameters, R: RngCore + CryptoRng>(
    height: u32,
    rng: &mut R,
) -> Rseed {
    if P::is_nu_active(NetworkUpgrade::Canopy, height) {
        let mut buffer = [0u8; 32];
        &rng.fill_bytes(&mut buffer);
        Rseed::AfterZip212(buffer)
    } else {
        Rseed::BeforeZip212(jubjub::Fr::random(rng))
    }
}

pub fn deserialize_extended_point(
    buf: &mut &[u8],
) -> borsh::maybestd::io::Result<jubjub::ExtendedPoint> {
    Option::from(jubjub::ExtendedPoint::from_bytes(
        &BorshDeserialize::deserialize(buf)?,
    ))
    .ok_or_else(|| Error::from(ErrorKind::InvalidData))
}

pub fn deserialize_scalar(buf: &mut &[u8]) -> borsh::maybestd::io::Result<bls12_381::Scalar> {
    Option::from(bls12_381::Scalar::from_bytes(
        &BorshDeserialize::deserialize(buf)?,
    ))
    .ok_or_else(|| Error::from(ErrorKind::InvalidData))
}

pub fn sdeserialize_extended_point<'de, D>(
    deserializer: D,
) -> Result<jubjub::ExtendedPoint, D::Error>
where
    D: Deserializer<'de>,
{
    let s: [u8; 32] = Deserialize::deserialize(deserializer)?;
    Option::from(jubjub::ExtendedPoint::from_bytes(&s))
        .ok_or_else(|| Error::from(ErrorKind::InvalidData))
        .map_err(serde::de::Error::custom)
}

pub fn sserialize_extended_point<S>(x: &jubjub::ExtendedPoint, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    x.to_bytes().serialize(s)
}

pub fn sdeserialize_scalar<'de, D>(deserializer: D) -> Result<bls12_381::Scalar, D::Error>
where
    D: Deserializer<'de>,
{
    let s: [u8; 32] = Deserialize::deserialize(deserializer)?;
    Option::from(bls12_381::Scalar::from_bytes(&s))
        .ok_or_else(|| Error::from(ErrorKind::InvalidData))
        .map_err(serde::de::Error::custom)
}

pub fn sserialize_scalar<S>(x: &bls12_381::Scalar, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    x.to_bytes().serialize(s)
}

pub fn sdeserialize_array<'de, D, U: Deserialize<'de> + Into<T>, T: Debug, const N: usize>(
    deserializer: D,
) -> Result<[T; N], D::Error>
where
    D: Deserializer<'de>,
{
    struct ByteArrayVisitor<U, T, const N: usize>(PhantomData<U>, PhantomData<T>);

    impl<'de, U: Deserialize<'de> + Into<T>, T: Debug, const N: usize> Visitor<'de>
        for ByteArrayVisitor<U, T, N>
    {
        type Value = [T; N];

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            write!(formatter, "an array of length {}", N)
        }

        fn visit_seq<A>(self, mut seq: A) -> Result<[T; N], A::Error>
        where
            A: SeqAccess<'de>,
        {
            let mut arr = Vec::new();
            #[allow(clippy::needless_range_loop)]
            for i in 0..N {
                let elt: Option<U> = seq.next_element()?;
                arr.push(
                    elt.ok_or_else(|| serde::de::Error::invalid_length(i, &self))?
                        .into(),
                );
            }
            Ok(arr.try_into().unwrap())
        }
    }

    deserializer.deserialize_tuple(N, ByteArrayVisitor::<U, T, N>(PhantomData, PhantomData))
}

pub fn sserialize_array<S, U: Serialize + From<T>, T: Clone, const N: usize>(
    arr: &[T; N],
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let mut seq = serializer.serialize_tuple(arr.len())?;
    for elem in &arr[..] {
        seq.serialize_element(&U::from(elem.clone()))?;
    }
    seq.end()
}

#[derive(Serialize, Deserialize)]
pub struct SerdeArray<T: Clone + Debug + Serialize + for<'des> Deserialize<'des>, const N: usize>(
    #[serde(serialize_with = "sserialize_array::<_, T, T, N>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, T, T, N>")]
    [T; N],
);

impl<T: Clone + Debug + Serialize + for<'des> Deserialize<'des>, const N: usize> From<[T; N]>
    for SerdeArray<T, N>
{
    fn from(x: [T; N]) -> Self {
        Self(x)
    }
}

impl<T: Clone + Debug + Serialize + for<'des> Deserialize<'des>, const N: usize> Into<[T; N]>
    for SerdeArray<T, N>
{
    fn into(self) -> [T; N] {
        self.0
    }
}

pub fn sserialize_option<S, U: Serialize + From<T>, T: Clone>(
    opt: &Option<T>,
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    opt.as_ref()
        .map(T::clone)
        .map(U::from)
        .serialize(serializer)
}

pub fn sdeserialize_option<'de, D, U: Deserialize<'de> + Into<T>, T: Debug>(
    deserializer: D,
) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: Option<U> = Deserialize::deserialize(deserializer)?;
    Ok(s.map(U::into))
}
