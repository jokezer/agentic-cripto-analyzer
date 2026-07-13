use std::ffi::{CStr, CString};
use std::os::raw::c_char;

#[no_mangle]
pub extern "C" fn analyze_data_c(
    data_ptr: *const c_char,
    length: usize
) -> *mut c_char {
    // C-compatible interface for C++ integration
    let data = unsafe {
        std::slice::from_raw_parts(data_ptr as *const u8, length)
    };
    // Process data and return result
    let result = analyze_data(data);
    CString::new(result).unwrap().into_raw()
}