package com.biblio.tests;

import com.biblio.pages.DashboardPage;
import com.biblio.pages.LoginPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DashboardTest extends BaseTest {

    @BeforeEach
    void login() {
        LoginPage loginPage = new LoginPage(driver);
        loginPage.open(BASE_URL);
        loginPage.typeEmail(TEST_EMAIL);
        loginPage.typePassword(TEST_PASSWORD);
        loginPage.submit();

        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.waitLoaded();
    }

    @Test
    void navigationVersLivres() {
        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.goToLivres();

        assertTrue(driver.getCurrentUrl().endsWith("/livres"));
    }

    @Test
    void deconnexion() {
        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.logout();

        assertTrue(driver.getCurrentUrl().endsWith("/login"));
    }

    @Test
    void navigationVersUtilisateurs() {
        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.goToUsers();

        assertTrue(driver.getCurrentUrl().endsWith("/users"));
    }

    @Test
    void navigationVersEmprunts() {
        DashboardPage dashboard = new DashboardPage(driver);
        dashboard.goToEmprunts();

        assertTrue(driver.getCurrentUrl().endsWith("/emprunts"));
    }
}
