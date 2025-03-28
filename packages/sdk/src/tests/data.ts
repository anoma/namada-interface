import { CryptoRecord, KdfType } from "../crypto";

export const RPC_URL = "http://localhost:27657";
export const NATIVE_TOKEN = "tnam1qxvg64psvhwumv3mwrrjfcz0h3t3274hwggyzcee";
export const CHAIN_ID = "localnet.a905b497170d585eb67fd";

export const MNEMONIC_1 =
  "liar bird install win wool venue observe maid flock clap bullet myth illness trip bread fresh polar smart use lunar tired embody come deer";

export const MNEMONIC_2 =
  "resist mystery settle ask saddle great kite tragic leaf improve ticket admit analyst tomorrow tobacco aim desk melt wheel despair patch ketchup calm winner";

export const ACCOUNT_1 = {
  address: "tnam1qz4sdx5jlh909j44uz46pf29ty0ztftfzc98s8dx",
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  privateKey:
    "59f0d21f1c7375697275d8fe6ef58b06505f5a073aeca5c5b05e0dda24bd6324",
};

export const ACCOUNT_2 = {
  address: "tnam1qry3lnk03j965y92np6e25jvadk3kw9u7cvwjclp",
  publicKey:
    "tpknam1qrxzmeyka3v43jnrhep9stnj3jhtgzq96ku3u6lk8hy8xqmjqgjtw8qu274",
};

export const SHIELDED_ACCOUNT_1 = {
  paymentAddress:
    "znam1umjfq8d8s5n3chelg8xgv6cf5kh53cjkgclzuhnnp9nl548gmpjaajyuywla88xlpn0cuvcs86f",
  spendingKey:
    "zsknam1qwwdw6q4qqqqpqy6qves7kzmv7lnul54ven0hw835smj5gu9zsac42gc7cagzlwauaf06exmuhw3dwxlfw5fdle3j6qdj9h5f5eu3r8nyr46jhsad5jqksresavcxffs5f7vhs8dflc70apu22kckyp24znapt2f0vpp4lgtfy98a35kd2rgydfrr25cuwf9xw9emfs6z3rvap87dprehwmwylz4glne2d3pqe8dds6h8ssczx8n6ps9zdeqe08fs3adm07uw5q83rqgtv7fq",
  viewingKey:
    "zvknam1qwwdw6q4qqqqpqy6qves7kzmv7lnul54ven0hw835smj5gu9zsac42gc7cagzlwau7x9csywszmdj4fxhadd5464cxqt3p5kzqerkl8s7g4y48s4xs3t7gett2e8g32k2enh587ne7mwzmvetjtukpd9mwh8wlfckw4t5qyzfy98a35kd2rgydfrr25cuwf9xw9emfs6z3rvap87dprehwmwylz4glne2d3pqe8dds6h8ssczx8n6ps9zdeqe08fs3adm07uw5q83rq23y79r",
  path: { account: 0 },
};

export const SHIELDED_ACCOUNT_2 = {
  paymentAddress:
    "znam1surgreuttyc0g3pjyh09hld5vfkmcxf5l6rfdhx4zl23sx9mg4p2venfdpevfj03yjyxzchyakk",
  spendingKey:
    "zsknam1qv4e0uyzqyqqpqyflphwkdus6je2er4vxdlmt4kd0eqt3afsp4r8ua7dc2c4gpau0x7km40uct3ve73a93mum75ldyvtq3g87ykh4rflpe0m8035qpzs9y996dmnc9t9x6a5mj0wl7xcdzfeczar3kttfhu9dl6m49gd7cgr9vka8cldpmkpvvlc4pvuzujg6r8q6nrzle2808mv0am6jg36lx9dat6z5pf7284dg7x8kgujuw5gvuaxfvj7q2h3eaj30rn3sek9trcssww6u",
  viewingKey:
    "zvknam1qv4e0uyzqyqqpqyflphwkdus6je2er4vxdlmt4kd0eqt3afsp4r8ua7dc2c4gpau0y9a8ac5cchspzm5w8cuepcxpdd0l0t5cttlx775tqlsh2ft9te60g4spv7fgzgrtk0kqtlk07vp3qj3qnvanu2jgeqyrgunc5y2uw2j9vka8cldpmkpvvlc4pvuzujg6r8q6nrzle2808mv0am6jg36lx9dat6z5pf7284dg7x8kgujuw5gvuaxfvj7q2h3eaj30rn3sek9trcuumrdf",
  path: { account: 1 },
};

export const SIG_VALID = {
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  hash: "3e80b3778b3b03766e7be993131c0af2ad05630c5d96fb7fa132d05b77336e04",
  signature:
    "0042da84d595df74f83e55e8688055055bed0ec9bd6aee0d27f8464a12d598453bf65f980af1cbf444c81374ec903eef05ee43b5f7f69aea698c7d19d7929e8108",
};

export const SIG_INVALID = {
  publicKey:
    "tpknam1qptrn64myunqr4847yq4cn0uwek5ecwc7eeexjfc5npmd5kmg6ex563n5as",
  hash: "3e80b3778b3b03766e7be993131c0af2ad05630c5d96fb7fa132d05b77331234",
  signature:
    "0042da84d595df74f83e55e8688055055bed0ec9bd6aee0d27f8464a12d598453bf65f980af1cbf444c81374ec903eef05ee43b5f7f69aea698c7d19d7929e8108",
};

export const CRYPTO_RECORD: CryptoRecord = {
  cipher: {
    type: "aes-256-gcm",
    iv: new Uint8Array([
      212, 166, 231, 90, 131, 247, 196, 207, 66, 71, 201, 168,
    ]),
    text: new Uint8Array([
      213, 100, 25, 62, 43, 192, 91, 100, 221, 131, 57, 212, 134, 120, 145, 164,
      22, 83, 154, 4, 239, 216, 234, 151, 221, 18, 200, 109, 147, 239, 20, 42,
      129, 253, 82, 158, 151, 235,
    ]),
  },
  kdf: {
    type: KdfType.Argon2,
    params: {
      m_cost: 65536,
      t_cost: 3,
      p_cost: 1,
      salt: "xwPSE+/sF+hIR4nE+Zl7MQ",
    },
  },
};

// Generated payment addresses for SHIELDED_ACCOUNT_1
export const PAYMENT_ADDRESSES_1 = [
  [
    1,
    "znam1umjfq8d8s5n3chelg8xgv6cf5kh53cjkgclzuhnnp9nl548gmpjaajyuywla88xlpn0cuvcs86f",
  ],
  [
    3,
    "znam1knvtpalk57w3cv7eed9tfhztf9msyx2rps9hldcksu4dhr8ut98270nvv8hutl9p9dlfxdhp0wl",
  ],
  [
    4,
    "znam13w787nxj7x6sx82fwjnsmtgnau388snvd0g2qw8ny732pdrwjwel2p7yjpk8xk48jww4ya7l06t",
  ],
  [
    5,
    "znam1hmq9nscvpe5pspc3zuqsrmx8xfdw35s0m9enkn4xv3f0kxed27z0jjeedesp3qvtqdwcuzmuyft",
  ],
  [
    7,
    "znam1hwpa0eq0t8my5nqkn5xxvzw2jfq50aaw0trmfm679ey8rg6healpu8smrdm5kgmhfz0mcqvx85h",
  ],
  [
    14,
    "znam12e5nczcuerqpjt55ql3rqw2ec98ucdtl987papmh64jfsrghamd463xf3rnz73p4tfg7vm98rhx",
  ],
  [
    18,
    "znam1yyr93jknvnv9rkclp2r6kra8zpvdzq8mtt4rqjakyhhkwwpe4j9kyqatk4uj96n6zp6t7wesf2z",
  ],
  [
    24,
    "znam1xzlh0cz0jzq8wettpxgqur489a27x0ns5dnhqskr7pj8sulc3grqd8dea0mr394plf4fxw9gal0",
  ],
  [
    25,
    "znam1f469xsqazakja8e3vz2s3tl8px4ly9cghcmurnmqgdft6h5eu6y5wxnyw6eetyhgcykny3gjyjx",
  ],
  [
    29,
    "znam1dt240awa35nrx7qj86q5n92dm2kvf8nugqj6adjxca88ndkh93p22x45u6cq0n4fddk6qpenx7y",
  ],
  [
    30,
    "znam1qh3t62jld9narsntkr7aatyl70zqew7ffwphfth4lyy3akkg7hzlup4hn2tvr7cta05ggczfqvn",
  ],
  [
    31,
    "znam1ejm54qdcr6yyg56v92cw2leekfxusw3y74ys4rslduguf3ds5nde2d9exlaxcfm0rcv276nfxue",
  ],
  [
    34,
    "znam13lsgvaf6kwgagkz9j3ttr4dj9f2hg62un8j0eer97p4d2qph3w9g8d4sfve8r2juz5gu5sppps6",
  ],
  [
    35,
    "znam135qtkz2yzrnn7g9m2ed8dxk63vf5m5qxt799ypxwj3kmg7agaanad3jqkrhsykpkfx0u5gx75ny",
  ],
  [
    37,
    "znam1lwj39eztet8mcgdxf8gwcgrrzpgtvse8cf5u6t84jd7wgyywsaq23t6g0rauz6mz90uf5u4ztlj",
  ],
  [
    41,
    "znam1fle80rcmgxumqggvdte6j5fdtvej5krzphct6ldz35n8ecg2u5lzndaa60qglt7sc0hjuhad054",
  ],
  [
    43,
    "znam14rlawaqh5hlx58ns9u9m3g6zlvf97hag7fuaa2gfr25f22qj4mxcavhn7mr287tazak8zlzwfem",
  ],
  [
    45,
    "znam1rrlyalgm6n3xy5vmcare5p2qey3n93cz2ch9z35y3czjgkkmngvjz5m4tddrncalwc3g5cecj4r",
  ],
  [
    46,
    "znam1vjy05v2z4xnx5pwkj84m6rj50uyt8zrdjql64aeunm97cr8zr5ckgdxt84cx4v4dhhjzzqwky8a",
  ],
  [
    47,
    "znam1xkhae3duynpy6ekykl5v40ujrue5u20stspu3y5hjy4s2ez4ezdsktd6glg4py797p8es5v4frs",
  ],
  [
    48,
    "znam164qfezxfpppexq0ncm4wpsyelc7p8m5q0p6alystlpjwpzwf88jr784gv0ghs0nl3zqcuvxc0fe",
  ],
  [
    59,
    "znam1fztyrjpv7s5thv3egl5qhztnmv6mfkaw9d53c3cmvct7rfedmyyfymjk2uxjh9ph5933cy0naa7",
  ],
  [
    60,
    "znam1tanyn4clnz085hlg98nswf7ahsjgchqdhmrkluug0hasc5cnwfxeqppykffv7drjqmg2kn8tz6j",
  ],
  [
    63,
    "znam1qh4xqpmqp7njsgm40y52z528g4e6ddc44cysykvplyc5uyyg5cwupmlj04xw4536xsefq0nr07j",
  ],
  [
    64,
    "znam14tmylttfvw3hlvhry9jketnma846kssg9dz4wu5u5acyhf0x8mtlus897pcwgssd2fcx73906av",
  ],
  [
    69,
    "znam16cjz8ws4qe375cag7alnax03qtv0rnzzy8euczk88pmppz6d6a646jgth6tyzsmwh4wjxh6guj9",
  ],
  [
    70,
    "znam160h5jz7ls4lg7lcz0enrzzt6ckd2n8usvs2c78p2jcf5etx3dqfdlfpqtqkp8s3pxw46qfnhmlv",
  ],
  [
    73,
    "znam17cxswxxqm5hw8q94f5vl3fe6lyvm2uejeht64y37qvfdghaxgw8qng8y5ychmr22y632vrr6s6f",
  ],
  [
    77,
    "znam1p05qud9264ckrszfqwt8mn957m09953zx0gws9xyhsy9dlr8h3fhw06szaq8s23kqw877rt6m9m",
  ],
  [
    81,
    "znam1v25fc2eap4p5m43dv275hqzxzaq6hsuzep8zffz3plkrujc9cyh2d3zswxcaux3tah8q5dj9g3j",
  ],
  [
    82,
    "znam1t7j87uh5esyae5hla59ryh5p77fl8tjne4tfpq52f7y4wjgrrzexjncja923wvvw59muzuxygr3",
  ],
  [
    83,
    "znam16n27x79ku85kvk9zppts6n9scrvafvshksnmqytrkeejvupj9rr2ru89aty668ap2q46q7k4pay",
  ],
  [
    86,
    "znam1v6zs3dpk8nkdkk5h4kdfgw8a3tjqxgy0pe2vzujwu296ghg57x3ygy0alz3ugu89malrjk5uvwx",
  ],
  [
    88,
    "znam1qaq8y7xgtm5eh0u3c9td33e863m2c5xqerl7ccd3xd0agvquuwenz4xmsapccpv569xjgd9jwvj",
  ],
  [
    89,
    "znam15fkvfmrm6jr8zv4hjvyhv3zhgptmucv2uaxdx4n5gn3590yjp0776nlg373hknwjxgkc7qxha9y",
  ],
  [
    90,
    "znam1hkeeqqexanunr22u602gpcjrgslg3rsypjtkm3qj6ssnervhm7lwuxd59c2t879f46vpjxva6gy",
  ],
  [
    93,
    "znam1nfuf4wr0m2m9zclm8x68kh2sdpk2vx2snvgu2kh89amxhre0le33p8xjk3c52nd9w9tg7qyqute",
  ],
  [
    98,
    "znam1tsv4739e79z7r2t83rvj24lrtrmv89unxs33vv2jljdfkmgg2gk0ptedksl3zthn0ve4zqw9mfx",
  ],
  [
    99,
    "znam1jxs2a95xplsnfncq775666rvt8y4p9sk4jgflfmujtc4hc36ur27xmwfdltfl7ft3ccpstmewkp",
  ],
  [
    100,
    "znam1r8ef08rp4kjvj33ltv6jjhgw0f5h8zq6kr2enpjsjxcf6sqr0a2fl4wyqklsgu0ntgufssnr7h6",
  ],
  [
    101,
    "znam16n96pxfc86vv2gmtzz7kmgq8z47hrzks3cf9qh9pmzuh08hkvsaeq2ym3zwrvu9gn8e2zjcjyle",
  ],
  [
    112,
    "znam1grya8ll6e6u92k2ls5xvdqa8dsd66d2jlccxe6r68223w9mmtw5ked7h700nayrdnq4vxlwnzyp",
  ],
  [
    115,
    "znam15j64x3e3n5zeghzkqxwa9g6vsasndsm5c9fad0zf288udkavtr0u5u9f3jnyk5hha35ygja0m9u",
  ],
  [
    117,
    "znam19453e97sw8cjmaa7nskcq29kxu0wz5sd7mej0uwf3ts20jgypy9xz3m2n8rnkta4q8s5gqa0a27",
  ],
  [
    118,
    "znam1lp9yqrs6w6d6zlzzfp5zv38vlyl2unhghgam7tn4tjj2qtkfmfpc4qnuqjxltml0xvkny3lplfu",
  ],
  [
    122,
    "znam18fgmk5dz63m50xtfh9ewm0dmer5h47836seqqkhaefyarjfdwmd8r6vx8e37r458cyjg2eyrjql",
  ],
  [
    125,
    "znam1cuvt8tpktgu6u34j7fvuuupz8rxp60wklvg6hs56r025tk95ms5v3lkhj8myscuw59x77f47zes",
  ],
  [
    129,
    "znam1jhdcerd5x6peywlffmh0j9r6q75wyfumjc3kdugfwz0n7a79ex9vnc6cehw58usrflqcc5axl22",
  ],
  [
    133,
    "znam1l30hx49x989xfxf5lque5yj5gvcqknmq4exkmkjucnv87ucc4mez44jhqxr2aep7k85qqc48y9y",
  ],
  [
    136,
    "znam1zzfvsa5jnpkhzeht78yqn67sjhrqaewrddas0939qrg40zpfmppkcvfg434qm48g3udm7p80efd",
  ],
  [
    137,
    "znam1k9d6exyeke3ksym78fnzsmv6xu6fl64mq4fffvn8rkl8vatunskurqffgkl9j3lp50uhy4z4qdc",
  ],
  [
    140,
    "znam180fne6kj59aq7hp0z770avk9g6j8cgkjk8gzgn2ghygaqkqpf9zz84rfe83h2trlh0nfy5mum0h",
  ],
  [
    142,
    "znam13qf4g4448reh6d9fke664nt7q6kjylw9x7su4rrnu2em857yghes267y0qy9zuyv8v8x76mrx0c",
  ],
  [
    144,
    "znam1yglrm9j2ej3sjjck83pswsxewg9mmttcdf2rqvpteerp8a0fwtws66v57zmv65mm5xm6sea0rdw",
  ],
  [
    145,
    "znam17s6p3mrcjlxeh9kpk7vvgjkrdy7xjq0728afasfltvr30s85tt63lg34xqzu74rn2umvz47te22",
  ],
  [
    146,
    "znam15je2ts9xqtn6gt4dzy83325ljrk4j8f32y8m7qxvw52zhfpe72zxx8qxf240q4zwe7s9sffpmew",
  ],
  [
    147,
    "znam1sxu93zkkm29cn4u5es2pk6t70egs7hfydq2rvvttr03k3x02n7xw9f2pnfnj9u8krcu5u9lrux7",
  ],
  [
    149,
    "znam1qypmkhclmna5ewhm9u4jk6wxqd7m7vu768jwpyguulcydllag89ar3vecrqldmytjdvdkxgvwsa",
  ],
  [
    153,
    "znam1mkzs7sswmg8ed09x282q0gfxsr9u0j0puynft8x4rq2387emvqu6nfm5yt7vcx4p9d7q7x0s99r",
  ],
  [
    157,
    "znam1ccwd9jtk4kfhwv3fcqgz6hqxa29d946e63ym7uqj20cpmrr5nj8xl0n97ycnw3mdy7yhzfv2760",
  ],
  [
    160,
    "znam1pc5fwk94mrxjrfa4spc5pm4j8sp9sa2gr7am2c8w5f8zq82k4lcarpl43a0e79msjfcr7h7k8nn",
  ],
  [
    162,
    "znam1899vw5tpweftugunr3s7r2td28yeg60ual9cu45h6dr24lnlprsmg24emn8wrykj4z2pjvzk6st",
  ],
  [
    164,
    "znam185cpufrdhaqzju4df54t6u5ywv0gl8twt3u05cpp907fls9mh3fp2qarh8x6e72a2zz6643rcv6",
  ],
  [
    165,
    "znam1te7wjf79k3jg78qq5nrtx3lnx50t4mud6k64454yw3mjselu9mey2xhxmajghk3rwel3qp0jger",
  ],
  [
    166,
    "znam10a7ag8tx7p2frnwyqnvmt79h9l8f6vdnjjmx38kpls8vcj4wk93rg5p5hgufxxptdw8ecwjmnnz",
  ],
  [
    171,
    "znam1qpnqc7jpf06yglj5ukfn7gyskgq9ceshak5asqs7m942p2mae6hj0elav6h6a45yhuuvze6mmj7",
  ],
  [
    172,
    "znam1f2z7ruz8gz2z2wxsggu6sm9m5zqmfn0k69usj4t896jvk38c8842kuzwena3pzrj2pz2c24qmkr",
  ],
  [
    177,
    "znam1vcn78fv7cv42ytjf5cqqxy66p6vfvsj6xv43j6vy7c7p4e2pcl9qq3y9dx8ptk257fygvqwykk6",
  ],
  [
    178,
    "znam1k857kgmmu30drawq2dqt4mqfr0rka2dullfzj539wudx3lpyaq7rw70q866hazyqvc9qk6h98r9",
  ],
  [
    179,
    "znam19nju7hz7dpqrx3c9gw3xgxazvv2zlt9gvp2cr8asatmhwnax2ea2eswg7gl24n9m8w7kj8rc57q",
  ],
  [
    180,
    "znam1mu8txcrulnw0zxtg9s9hkt5tywwtxpmrhmz3gx0cxw09exl2hxxz4snyu8etr6aj8md36muzsa2",
  ],
  [
    181,
    "znam1tdq3e9c5ug0yep76emtelf6uf22z32husxqphrhv9cf8hk5nwl55s4mfn7tg2tlpl5g4q7dahjp",
  ],
  [
    183,
    "znam1jpqzkqaew37k79v04pmlat00xv5vw9te0qk9s6u8vptmmm9dgada94w7ktmanqc4mfghqlwwjf7",
  ],
  [
    187,
    "znam1wg0s0k6xmrmmxq92n5pctjpudkdhl8kchz96gphzfv4q4w8ak2wxsnh9ks0r4ec8skrygkd5sxu",
  ],
  [
    189,
    "znam1w74ny74rgxs5ncgj2ellm7h8vkpud3uaf2hk0theqye0urftdphgx5l9rlq9xnqy4pmnjkzvafd",
  ],
  [
    191,
    "znam19mzwgv0znq3q4qca58s7nkykjjk5c8p0sfpzuckl7g05kp5d2x3gdchlwqnqs25kmfws7fmt82g",
  ],
  [
    192,
    "znam186auxeyudn5kpx3kz8g3pqfyt29h0y0wltvte6pdef6dn3v6mjqls5a5004nms83u0rwxe84fe0",
  ],
  [
    193,
    "znam19d79fackf90z92f28jfhl6gqa97ttx2gc5f7vxv89036sj8a37cwstnt0hah3tcwjyruqujf495",
  ],
  [
    195,
    "znam1xl7cqlzydhm80emwpx29a2u67xmqzhx7ttzye5pct3w7zlseek3z2ysskgk0nz5ym2mu5kz90lw",
  ],
  [
    197,
    "znam16eqwqhrvlgwu36f6gxwjf8dkkmnrpreettfv5wf0pzw6e7eca7aw0eumnu2shruclaceyfj7qy8",
  ],
  [
    198,
    "znam1janppgk6fgncn9g80dsaj49rfqwpmm77n6mdpl90h5my39cqzzrx8ec4tce4e4pg03e4qatl7p7",
  ],
  [
    199,
    "znam1jx49p5afwn8lrk86h4r7xvx0ea3gng3r6py2qcns22vfxljuupkdgzx4kyrx78vrtn0fjyqtj8u",
  ],
  [
    202,
    "znam1vhk9rfn5njsp08cgkgvnw3hgw0mh64quzepdafmyexhcuzyrxrlrjssmlsqfx73y6wyusdgjwjm",
  ],
  [
    203,
    "znam1xyg0k38na8t7eay67lkrudftwja8n6mf5pj337n9n7w8l75cfejzljcdm8920rsyfpr37tnfeky",
  ],
  [
    204,
    "znam1cx3gw7cplwjvgl7nyq8awx82v3s70hzvnmragk8wpzvmfe0aet79pd3fcjppz3l389l96y0ssxh",
  ],
  [
    205,
    "znam136emj33x2cdzteer35r5vehllc8kzj6jpgkhxhq2ra0c85legvchcm0g6tqtdcxxqyl9spc7mm0",
  ],
  [
    206,
    "znam1kj4vneqah5dc0k9lj83xx9jmr4l2edfqwlz6p2s6y85ygp7jmtzv9ezan2expwvwts0cqfpfz6u",
  ],
  [
    209,
    "znam1xhzhnslq453fp7wgy5e62fmerkudra9kfwnzv96hquzvjd5nszfvvq96dlpk9uuvgmks2pygajv",
  ],
  [
    210,
    "znam1343h8spxq9me0hqmnyv9u9ne92lt88tack6dpxqls2u5m9avzy0lh2kc060qxen29zq5wqedxrw",
  ],
  [
    211,
    "znam19m4l2434pw4mk48gtrasm80v8ns88vt0ksw4krney8xlmwlpnt5hgksgt9ak07py9nyd5hcev3u",
  ],
  [
    212,
    "znam1pjzhaaxj7gyx664tsfsxxc7ga6m375md6u4zdj3j64mh427mc226qkz5keazjrlw6gw6xvt638w",
  ],
  [
    213,
    "znam1wd2zj6jvengze8q4rzlct7qv2he7wqa7xme449j3ssxmap4vhrxlje766zp707uj7mftjgl7qy3",
  ],
  [
    214,
    "znam19hgcrfgawnlnhe80n0zxvjz5wk37zxpscwa7dlx8qxw2fuqa7gw9zmlfvee2k2fem2877wulgte",
  ],
  [
    216,
    "znam128742jg0mq0pky2jelqcs9jwu4u84m5qkmcyjvxskre27wl4s0r92l3jhnk77geuk9mwqtnx3ta",
  ],
  [
    219,
    "znam1dfap9ted7c4mkknjkwus8z92dwa9c9gf2as3xgaq70m7wu5gpk89s76wp3qcf20zflsr6drs9xn",
  ],
  [
    220,
    "znam10sjppjcxjn6r45ppxh90l2h2afc5xzuer40nt4z7agrl8nhzs05kf9xvrleerrh3nfjayk765hq",
  ],
  [
    223,
    "znam1h04wv4tnpts8uxc0ev3t68x2kaz9nkermq9h58hzae9m598mwa4zhpr2vs66j6nw9rkn7kkh0kl",
  ],
  [
    232,
    "znam1esvk2kgxktpefwr7yqzt5v04lwu5rdldafrtlddrw23nr7vgrqfg6rwngnyhh7sc0h64gpqjmp8",
  ],
  [
    233,
    "znam1nv0a2evau4ssw4a8nv58q5lm76hjkkz8qrtyy3765szqxyazfmuje063nyej36ac8n09ygyv4a0",
  ],
  [
    235,
    "znam1valgzwrchhftstf8cjz56w7jw9gvyy8m5r2gg34dmhy49fuc5x9qz2xx29s4t0q0vjhqs3klm0f",
  ],
];
