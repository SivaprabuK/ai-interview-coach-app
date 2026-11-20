def test_create_profile_with_question_count(
    client,
    auth_headers,
):
    response = client.put(
        "/api/v1/profile/",
        headers=auth_headers,
        json={
            "professional_summary": "Python Developer",
            "years_of_experience": 2.5,
            "technical_skills": ["Python", "FastAPI"],
            "target_roles": ["Python Developer"],
            "preferred_difficulty": "Advanced",
            "preferred_question_count": 15,
        },
    )

    assert response.status_code == 200

    data = response.json()["data"]

    assert data["preferred_difficulty"] == "Advanced"
    assert data["preferred_question_count"] == 15

def test_create_profile_invalid_question_count(
    client,
    auth_headers,
):
    response = client.put(
        "/api/v1/profile/",
        headers=auth_headers,
        json={
            "professional_summary": "Python Developer",
            "years_of_experience": 2.5,
            "technical_skills": ["Python"],
            "target_roles": ["Python Developer"],
            "preferred_difficulty": "Intermediate",
            "preferred_question_count": 7,
        },
    )

    assert response.status_code == 422