//! Types for wrapping sensitive data.
//!
//! Wrapped values will not automatically be accessible to JavaScript, so we can
//! avoid loading sensitive data into browser memory. However, values can be
//! accessed in JavaScript by using the pointer and length fields to read
//! directly from WASM memory if required.
//!
//! These types will also zeroize sensitive data when dropped.
use wasm_bindgen::prelude::*;
use zeroize::ZeroizeOnDrop;

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct VecU8Pointer {
    #[zeroize(skip)]
    pub pointer: *const u8,
    #[zeroize(skip)]
    pub length: usize,
    #[wasm_bindgen(skip)]
    pub vec: Vec<u8>,
}

#[wasm_bindgen]
impl VecU8Pointer {
    #[wasm_bindgen(constructor)]
    pub fn new(vec: Vec<u8>) -> VecU8Pointer {
        VecU8Pointer {
            pointer: vec.as_ptr(),
            length: vec.len(),
            vec,
        }
    }
}

impl Clone for VecU8Pointer {
    fn clone(&self) -> Self {
        VecU8Pointer::new(self.vec.clone())
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct StringPointer {
    #[zeroize(skip)]
    pub pointer: *const u8,
    #[zeroize(skip)]
    pub length: usize,
    #[wasm_bindgen(skip)]
    pub string: String,
}

#[wasm_bindgen]
impl StringPointer {
    #[wasm_bindgen(constructor)]
    pub fn new(string: String) -> StringPointer {
        StringPointer {
            pointer: string.as_ptr(),
            length: string.len(),
            string,
        }
    }
}

impl Clone for StringPointer {
    fn clone(&self) -> Self {
        StringPointer::new(self.string.clone())
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct VecStringPointer {
    #[zeroize(skip)]
    pointers: Vec<usize>,
    #[zeroize(skip)]
    lengths: Vec<usize>,
    #[wasm_bindgen(skip)]
    pub strings: Vec<String>,
}

#[wasm_bindgen]
impl VecStringPointer {
    #[wasm_bindgen(getter)]
    pub fn pointers(&self) -> Vec<usize> {
        self.pointers.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn lengths(&self) -> Vec<usize> {
        self.lengths.clone()
    }
}

pub fn new_vec_string_pointer(strings: Vec<String>) -> VecStringPointer {
    let pointers = strings.iter().map(|str| str.as_ptr() as usize).collect();
    let lengths = strings.iter().map(|str| str.len()).collect();
    VecStringPointer {
        pointers,
        lengths,
        strings,
    }
}
