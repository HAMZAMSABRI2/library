package com.biblio.tests;

import com.biblio.pages.RegisterPage;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterTest extends BaseTest {

    @Test
    void emailDejaUtilise() {
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.fill("Hamza", "Msabri", TEST_EMAIL, "password123");
        registerPage.submit();

        String error = registerPage.errorMessage();
        assertTrue(error.toLowerCase().contains("déjà"));
    }

    @Test
    void lienVersConnexion() {
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.goToLogin();

        assertTrue(driver.getCurrentUrl().endsWith("/login"));
    }

    @Test
    void champsObligatoiresBloquentSoumission() {
        RegisterPage registerPage = new RegisterPage(driver);
        registerPage.open(BASE_URL);
        registerPage.submit();

        assertTrue(driver.getCurrentUrl().endsWith("/register"));
    }
}
