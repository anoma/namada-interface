use crate::sdk::events::EventDispatcher;
use namada_sdk::control_flow::ShutdownSignal;
use namada_sdk::io::ProgressBar;
use namada_sdk::task_env::{TaskEnvironment, TaskSpawner};
use tokio::task::LocalSet;

#[cfg(not(feature = "multicore"))]
mod spawner {
    use super::*;
    pub struct TaskSpawnerWeb {}

    impl TaskSpawner for TaskSpawnerWeb {
        fn spawn_async<F>(&self, fut: F)
        where
            F: std::future::Future<Output = ()> + 'static,
        {
            tokio::task::spawn_local(fut);
        }

        fn spawn_sync<F>(&self, job: F)
        where
            F: FnOnce() + Send + 'static,
        {
            job();
        }
    }
}

#[cfg(feature = "multicore")]
mod spawner {
    use super::*;
    use rayon;
    use std::future::Future;

    pub struct TaskSpawnerWeb {}

    impl TaskSpawner for TaskSpawnerWeb {
        #[inline]
        fn spawn_async<F>(&self, fut: F)
        where
            F: Future<Output = ()> + 'static,
        {
            tokio::task::spawn_local(fut);
        }

        #[inline]
        fn spawn_sync<F>(&self, job: F)
        where
            F: FnOnce() + Send + 'static,
        {
            rayon::spawn(job);
        }
    }
}

pub struct TaskEnvWeb {}

impl Default for TaskEnvWeb {
    fn default() -> Self {
        Self::new()
    }
}

impl TaskEnvWeb {
    pub fn new() -> Self {
        Self {}
    }
}

impl TaskEnvironment for TaskEnvWeb {
    type Spawner = spawner::TaskSpawnerWeb;

    async fn run<M, F, R>(self, main: M) -> R
    where
        M: FnOnce(Self::Spawner) -> F,
        F: std::future::Future<Output = R>,
    {
        LocalSet::new()
            .run_until(main(spawner::TaskSpawnerWeb {}))
            .await
    }
}

// We can't use the real shutdown signal in the browser, so we just use a dummy one.
pub struct ShutdownSignalWeb {}

impl ShutdownSignal for ShutdownSignalWeb {
    async fn wait_for_shutdown(&mut self) {}

    fn received(&mut self) -> bool {
        false
    }
}

pub struct ProgressBarWeb {
    pub name: String,
    pub total: usize,
    pub current: usize,
}

impl ProgressBarWeb {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            total: 0,
            current: 0,
        }
    }
}

impl ProgressBar for ProgressBarWeb {
    fn upper_limit(&self) -> u64 {
        self.total as u64
    }

    fn set_upper_limit(&mut self, limit: u64) {
        self.total = limit as usize;
        let _ = EventDispatcher::new()
            .progress_bar_started(self.name.clone())
            .is_ok();
    }

    fn increment_by(&mut self, amount: u64) {
        self.current += amount as usize;
        let _ = EventDispatcher::new()
            .progress_bar_incremented(self.name.clone(), self.current, self.total)
            .is_ok();
    }

    fn message(&mut self, message: String) {
        web_sys::console::log_1(&message.into());
    }

    fn finish(&mut self) {
        let _ = EventDispatcher::new()
            .progress_bar_finished(self.name.clone())
            .is_ok();
    }
}
