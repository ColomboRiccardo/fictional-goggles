import os

from google.cloud import firestore

from app.config import settings


def get_firestore_client() -> firestore.Client:
    if settings.firestore_emulator_host:
        os.environ["FIRESTORE_EMULATOR_HOST"] = settings.firestore_emulator_host
    return firestore.Client(project=settings.google_cloud_project)
