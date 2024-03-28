#[cfg(feature = "web")]
mod masp_web;

#[cfg(feature = "web")]
pub use masp_web::WebShieldedUtils as JSShieldedUtils;

#[cfg(feature = "nodejs")]
mod masp_node;

#[cfg(feature = "nodejs")]
pub use masp_node::NodeShieldedUtils as JSShieldedUtils;
