package com.biblio.tests;

import com.biblio.pages.DashboardPage;
import com.biblio.pages.LoginPage;
import com.biblio.pages.UsersListPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UsersTest extends BaseTest {

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
    void afficherListeUtilisateurs() {
        UsersListPage usersPage = new UsersListPage(driver);
        usersPage.open(BASE_URL);

        int rows = usersPage.rowCount();
        assertTrue(rows > 0);
    }

    @Test
    void boutonModifierRedirigeVersEdition() {
        UsersListPage usersPage = new UsersListPage(driver);
        usersPage.open(BASE_URL);
        usersPage.clickFirstEdit();

        String url = driver.getCurrentUrl();
        assertTrue(url.contains("/users/"));
        assertTrue(url.endsWith("/edit"));
    }

    // @Test
    // void rechercheSansResultat() throws InterruptedException {
    //     UsersListPage usersPage = new UsersListPage(driver);
    //     usersPage.open(BASE_URL);
    //     usersPage.search("tesetnotfound@gmail");

    //     Thread.sleep(800);

    //     assertEquals(0, usersPage.rowCount());
    // }
}
