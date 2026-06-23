def test_health_check_without_authentication(test_app):
    response = test_app["client"].get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
