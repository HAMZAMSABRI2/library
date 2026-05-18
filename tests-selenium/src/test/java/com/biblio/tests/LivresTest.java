package com.biblio.tests;

import com.biblio.pages.DashboardPage;
import com.biblio.pages.LivresFormPage;
import com.biblio.pages.LivresListPage;
import com.biblio.pages.LoginPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LivresTest extends BaseTest {

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
    void afficherListeLivres() {
        LivresListPage livresPage = new LivresListPage(driver);
        livresPage.open(BASE_URL);

        int rows = livresPage.rowCount();
        assertTrue(rows > 0);
    }

    // @Test
    // void rechercheSansResultat() throws InterruptedException {
    //     LivresListPage livresPage = new LivresListPage(driver);
    //     livresPage.open(BASE_URL);
    //     livresPage.search("zzzxxx999");

    //     Thread.sleep(800);

    //     assertTrue(livresPage.isEmpty());
    // }

    @Test
    void boutonAjouterRedirigeVersFormulaire() {
        LivresListPage livresPage = new LivresListPage(driver);
        livresPage.open(BASE_URL);
        livresPage.clickAdd();

        assertTrue(driver.getCurrentUrl().endsWith("/livres/new"));
    }

    @Test
    void boutonAnnulerRevientALaListe() {
        LivresFormPage formPage = new LivresFormPage(driver);
        formPage.open(BASE_URL);
        formPage.cancel();

        assertTrue(driver.getCurrentUrl().endsWith("/livres"));
    }

    @Test
    void boutonModifierRedirigeVersEdition() {
        LivresListPage livresPage = new LivresListPage(driver);
        livresPage.open(BASE_URL);
        livresPage.clickFirstEdit();

        String url = driver.getCurrentUrl();
        assertTrue(url.contains("/livres/"));
        assertTrue(url.endsWith("/edit"));
    }

    @Test
    void suppressionAnnuleeLaisseLeLivre() {
        LivresListPage livresPage = new LivresListPage(driver);
        livresPage.open(BASE_URL);
        int before = livresPage.rowCount();

        livresPage.clickFirstDelete();
        livresPage.dismissConfirm();

        assertEquals(before, livresPage.rowCount());
    }

    @Test
    void champsObligatoiresBloquentSoumission() {
        LivresFormPage formPage = new LivresFormPage(driver);
        formPage.open(BASE_URL);
        formPage.submit();

        assertTrue(driver.getCurrentUrl().endsWith("/livres/new"));
    }

    @Test
    void stockNegatifEstRefuse() {
        LivresFormPage formPage = new LivresFormPage(driver);
        formPage.open(BASE_URL);
        formPage.fill("9999999999999", "Titre Test", "Auteur Test", "-1");
        formPage.submit();

        assertTrue(formPage.isStockInvalid());
        assertTrue(driver.getCurrentUrl().endsWith("/livres/new"));
    }

    @Test
    void lienRetourRevientALaListe() {
        LivresFormPage formPage = new LivresFormPage(driver);
        formPage.open(BASE_URL);
        formPage.clickBack();

        assertTrue(driver.getCurrentUrl().endsWith("/livres"));
    }
}
