package com.biblio.tests;

import com.biblio.pages.DashboardPage;
import com.biblio.pages.LoginPage;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginTest extends BaseTest {

    @Test
    void loginAvecIdentifiantsValides() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        loginPage.typeEmail(TEST_EMAIL);
        loginPage.typePassword(TEST_PASSWORD);
        loginPage.submit();

        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.waitLoaded();

        assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Test
    void loginAvecMotDePasseIncorrect() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        loginPage.typeEmail(TEST_EMAIL);
        loginPage.typePassword("mauvais-mdp");
        loginPage.submit();

        String error = loginPage.errorMessage();
        assertTrue(error.toLowerCase().contains("incorrect"));
        assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    void lienVersInscription() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        loginPage.goToRegister();

        assertTrue(driver.getCurrentUrl().endsWith("/register"));
    }

    @Test
    void champsObligatoiresBloquentSoumission() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        loginPage.submit();

        assertTrue(driver.getCurrentUrl().endsWith("/login"));
    }
}
