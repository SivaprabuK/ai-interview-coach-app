from app.models import User
from app.core.security import hash_password
from app.services.auth_service import AuthService
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from app.models import UserSession
from app.api.dependencies import get_current_user
from app.core.security import create_access_token
from app.db.database import get_db

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "testuser@example.com",
            "password": "TestPass123!",
        },
    )

    assert response.status_code == 201

    result = response.json()

    assert result["status"] is True
    assert result["data"] == {}
    assert result["status_code"] == 201
    assert result["message"] == "User registered successfully"


def test_register_duplicate_email(client):
    user_data = {
        "name": "Test User",
        "email": "duplicate@example.com",
        "password": "TestPass123!",
    }

    first_response = client.post(
        "/api/v1/auth/register",
        json=user_data,
    )
    assert first_response.status_code == 201

    second_response = client.post(
        "/api/v1/auth/register",
        json=user_data,
    )
    assert second_response.status_code == 409
    assert second_response.json()["message"] == "Email is already registered"


def test_login_user_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User",
            "email": "loginuser@example.com",
            "password": "TestPass123!",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "TestPass123!",
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] is True
    assert result["status_code"] == 200
    assert result["message"] == "Login successful"
    assert result["data"]["access_token"]
    assert result["data"]["refresh_token"]
    assert result["data"]["token_type"] == "bearer"


def test_login_user_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Login User",
            "email": "wrongpassword@example.com",
            "password": "TestPass123!",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpassword@example.com",
            "password": "WrongPass123!",
        },
    )

    assert response.status_code == 401
    result = response.json()
        
    assert result["status"] is False
    assert result["data"] == {}
    assert result["status_code"] == 401
    assert result["message"] == "Invalid email or password"


def test_login_user_not_found(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "unknown@example.com",
            "password": "TestPass123!",
        },
    )

    result = response.json()

    assert result["status"] is False
    assert result["data"] == {}
    assert result["status_code"] == 401
    assert result["message"] == "Invalid email or password"


def test_login_inactive_user(client, db_session):
    user = User(
        name="Inactive User",
        email="inactive@example.com",
        hashed_password=hash_password("TestPass123!"),
        is_active=False,
    )

    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "TestPass123!",
        },
    )

    assert response.status_code == 401

    result = response.json()

    assert result["status"] is False
    assert result["status_code"] == 401
    assert result["message"] == "Invalid email or password"


def test_get_current_user_with_valid_token(db_session):
    test_app = FastAPI()

    test_app.dependency_overrides[get_db] = lambda: db_session

    @test_app.get("/protected")
    def protected_route(
        current_user: User = Depends(get_current_user),
    ):
        return {
            "user_id": current_user.id,
            "email": current_user.email,
        }

    user = User(
        name="Token User",
        email="tokenuser@example.com",
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    tokens = AuthService.create_session(db_session, user)

    with TestClient(test_app) as test_client:
        response = test_client.get(
            "/protected",
            headers={
                "Authorization": f"Bearer {tokens['access_token']}"
            },
        )

    assert response.status_code == 200
    assert response.json()["user_id"] == user.id
    assert response.json()["email"] == user.email


def test_get_current_user_with_invalid_token(db_session):
    test_app = FastAPI()

    test_app.dependency_overrides[get_db] = lambda: db_session

    @test_app.get("/protected")
    def protected_route(
        current_user: User = Depends(get_current_user),
    ):
        return {"user_id": current_user.id}

    with TestClient(test_app) as test_client:
        response = test_client.get(
            "/protected",
            headers={"Authorization": "Bearer invalid-token"},
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"


def test_refresh_token_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Refresh User",
            "email": "refresh@example.com",
            "password": "TestPass123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "refresh@example.com",
            "password": "TestPass123!",
        },
    )

    old_refresh_token = login_response.json()["data"]["refresh_token"]

    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] is True
    assert result["data"]["access_token"]
    assert result["data"]["refresh_token"]
    assert result["data"]["refresh_token"] != old_refresh_token


def test_refresh_token_reuse_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Refresh User",
            "email": "reuse@example.com",
            "password": "TestPass123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "reuse@example.com",
            "password": "TestPass123!",
        },
    )

    old_refresh_token = login_response.json()["data"]["refresh_token"]

    first_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh_token},
    )

    assert second_response.status_code == 401

def test_logout_user_success(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Logout User",
            "email": "logout@example.com",
            "password": "TestPass123!",
        },
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "logout@example.com",
            "password": "TestPass123!",
        },
    )

    access_token = login_response.json()["data"]["access_token"]

    response = client.post(
        "/api/v1/auth/logout",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert response.status_code == 200
    assert response.json()["status"] is True
    assert response.json()["message"] == "Logout successful"

    second_response = client.post(
        "/api/v1/auth/logout",
        headers={
            "Authorization": f"Bearer {access_token}"
        },
    )

    assert second_response.status_code == 401

def test_update_account_success(client, auth_user, auth_headers):
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={
            "name": "Updated Test User",
            "email": "updated@example.com",
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] is True
    assert result["message"] == "Account updated successfully"
    assert result["data"]["id"] == auth_user.id
    assert result["data"]["name"] == "Updated Test User"
    assert result["data"]["email"] == "updated@example.com"

def test_update_account_duplicate_email(client, auth_user, auth_headers, db_session):
    User(
        name="Another User",
        email="another@example.com",
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )
    other_user = User(
        name="Another User",
        email="another@example.com",
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )
    db_session.add(other_user)
    db_session.commit()

    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"email": "another@example.com"},
    )

    assert response.status_code == 409
    assert response.json()["message"] == "Email is already registered"

def test_update_account_name_only(client, auth_user, auth_headers):
    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"name": "New Test Name"},
    )

    assert response.status_code == 200

    data = response.json()["data"]

    assert data["name"] == "New Test Name"
    assert data["email"] == auth_user.email

def test_change_password_success(client, auth_user, auth_headers):
    old_password_hash = auth_user.hashed_password

    response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] is True
    assert result["message"] == "Password changed successfully"
    assert auth_user.hashed_password != old_password_hash

def test_change_password_invalid_current_password(
    client,
    auth_user,
    auth_headers,
):
    response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "WrongPass123!",
            "new_password": "NewPass123!",
        },
    )

    assert response.status_code == 400
    assert response.json()["message"] == "Current password is incorrect"

def test_change_password_revokes_sessions(
    client,
    auth_user,
    auth_headers,
    db_session,
):
    response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
        },
    )

    assert response.status_code == 200

    sessions = (
        db_session.query(UserSession)
        .filter(UserSession.user_id == auth_user.id)
        .all()
    )

    assert sessions
    assert all(session.revoked_at is not None for session in sessions)

def test_old_access_token_rejected_after_password_change(
    client,
    auth_user,
    auth_headers,
):
    change_response = client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "TestPass123!",
            "new_password": "NewPass123!",
        },
    )

    assert change_response.status_code == 200

    response = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"name": "Should Not Update"},
    )

    assert response.status_code == 401