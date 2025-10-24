from __future__ import annotations
from typing import Dict, Any, Optional, List
import threading
import uuid
import os
import json
from datetime import datetime

_lock = threading.Lock()
_PREDICTIONS: Dict[str, Dict[str, Any]] = {}
_CONSULTS: List[Dict[str, Any]] = []
_USERS: Dict[str, Dict[str, Any]] = {}
_LOADED = False

def _data_dir() -> str:
    d = os.getenv("DATA_DIR", "./app/data")
    os.makedirs(d, exist_ok=True)
    return d

def _pred_path() -> str:
    return os.path.join(_data_dir(), "predictions.json")

def _consult_path() -> str:
    return os.path.join(_data_dir(), "consults.json")

def _users_path() -> str:
    return os.path.join(_data_dir(), "users.json")

def _load() -> None:
    global _LOADED, _PREDICTIONS, _CONSULTS
    if _LOADED:
        return
    try:
        with open(_pred_path(), 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                _PREDICTIONS = data
    except Exception:
        _PREDICTIONS = {}
    try:
        with open(_consult_path(), 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                _CONSULTS = data
    except Exception:
        _CONSULTS = []
    try:
        with open(_users_path(), 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict):
                _USERS = data
    except Exception:
        _USERS = {}
    _LOADED = True

def _flush() -> None:
    try:
        with open(_pred_path(), 'w', encoding='utf-8') as f:
            json.dump(_PREDICTIONS, f, indent=2)
    except Exception:
        pass
    try:
        with open(_consult_path(), 'w', encoding='utf-8') as f:
            json.dump(_CONSULTS, f, indent=2)
    except Exception:
        pass
    try:
        with open(_users_path(), 'w', encoding='utf-8') as f:
            json.dump(_USERS, f, indent=2)
    except Exception:
        pass


def save_prediction(record: Dict[str, Any]) -> str:
    """Store a prediction record and return its id."""
    _load()
    pid = record.get("id") or str(uuid.uuid4())
    record["id"] = pid
    record.setdefault("created_at", datetime.utcnow().isoformat())
    with _lock:
        _PREDICTIONS[pid] = record
        _flush()
    return pid


def get_prediction(pid: str) -> Optional[Dict[str, Any]]:
    _load()
    with _lock:
        return _PREDICTIONS.get(pid)

def list_predictions(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Return list of stored predictions, optionally filtered by user_id, newest first."""
    _load()
    with _lock:
        vals = list(_PREDICTIONS.values())
    if user_id:
        vals = [r for r in vals if (r.get('user_id') == user_id)]
    vals.sort(key=lambda r: r.get('created_at') or '', reverse=True)
    return vals

def save_consult(record: Dict[str, Any]) -> str:
    """Store a mock consult scheduling/send action and return id."""
    _load()
    cid = record.get("id") or str(uuid.uuid4())
    record["id"] = cid
    record.setdefault("created_at", datetime.utcnow().isoformat())
    with _lock:
        _CONSULTS.append(record)
        _flush()
    return cid

def list_consults(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    _load()
    with _lock:
        vals = list(_CONSULTS)
    if user_id:
        vals = [r for r in vals if (r.get('user_id') == user_id)]
    vals.sort(key=lambda r: r.get('created_at') or '', reverse=True)
    return vals

# Users store
def save_user(user: Dict[str, Any]) -> str:
    _load()
    uid = user.get("id") or str(uuid.uuid4())
    user["id"] = uid
    user.setdefault("created_at", datetime.utcnow().isoformat())
    with _lock:
        # Prevent duplicate emails
        for u in _USERS.values():
            if u.get("email") == user.get("email"):
                raise ValueError("email already exists")
        _USERS[uid] = user
        _flush()
    return uid

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    _load()
    with _lock:
        for u in _USERS.values():
            if u.get("email") == email:
                return u
    return None

def list_users() -> List[Dict[str, Any]]:
    _load()
    with _lock:
        return list(_USERS.values())
