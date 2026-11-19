"""
job_queue.py - Durable async task dispatch for dMRV satellite analysis.

Uses Celery worker queue when CELERY_BROKER_URL is configured and `celery` is installed;
otherwise dispatches cleanly via FastAPI BackgroundTasks with persistent DB job tracking.
"""
import os
from typing import Callable, Optional

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "")
_celery_app = None

if CELERY_BROKER_URL:
    try:
        from celery import Celery

        _celery_app = Celery(
            "carbonos_dmrv",
            broker=CELERY_BROKER_URL,
            backend=os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL),
        )

        @_celery_app.task(name="carbon_monitoring.run_analysis_task")
        def _celery_run_analysis_task(job_id: str):
            from .router import run_async_analysis
            run_async_analysis(job_id)

    except ImportError:
        _celery_app = None


def active_queue_backend() -> str:
    return "celery" if _celery_app is not None else "durable_inprocess"


def dispatch_analysis_job(background_tasks, job_id: str, worker_fn: Callable[[str], None]) -> str:
    """
    Dispatches an asynchronous AnalysisJob using Celery (if configured) or FastAPI BackgroundTasks.
    """
    if _celery_app is not None:
        _celery_app.send_task("carbon_monitoring.run_analysis_task", args=[job_id])
        return "celery"
    background_tasks.add_task(worker_fn, job_id)
    return "durable_inprocess"
