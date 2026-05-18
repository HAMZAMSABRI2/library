package com.biblio.tests;

import com.biblio.pages.DashboardPage;
import com.biblio.pages.EmpruntsFormPage;
import com.biblio.pages.EmpruntsListPage;
import com.biblio.pages.LoginPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class EmpruntsTest extends BaseTest {

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
    void afficherListeEmprunts() {
        EmpruntsListPage empruntsPage = new EmpruntsListPage(driver);
        empruntsPage.open(BASE_URL);

        assertTrue(driver.getCurrentUrl().endsWith("/emprunts"));
    }

    @Test
    void filtrerParStatutEnCours() throws InterruptedException {
        EmpruntsListPage empruntsPage = new EmpruntsListPage(driver);
        empruntsPage.open(BASE_URL);
        empruntsPage.filterByStatut("en_cours");

        Thread.sleep(800);

        assertTrue(driver.getCurrentUrl().endsWith("/emprunts"));
    }

    @Test
    void boutonNouvelEmpruntRedirige() {
        EmpruntsListPage empruntsPage = new EmpruntsListPage(driver);
        empruntsPage.open(BASE_URL);
        empruntsPage.clickAdd();

        assertTrue(driver.getCurrentUrl().endsWith("/emprunts/new"));
    }

    @Test
    void lienRetourRevientALaListe() {
        EmpruntsFormPage formPage = new EmpruntsFormPage(driver);
        formPage.open(BASE_URL);
        formPage.clickBack();

        assertTrue(driver.getCurrentUrl().endsWith("/emprunts"));
    }
}
