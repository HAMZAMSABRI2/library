package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class DashboardPage extends BasePage {

    private final By title = By.tagName("h1");
    private final By livresLink = By.linkText("📖 Livres");
    private final By usersLink = By.linkText("👥 Utilisateurs");
    private final By empruntsLink = By.linkText("🔄 Emprunts");
    private final By logoutButton = By.xpath("//button[contains(., 'Se déconnecter')]");

    public DashboardPage(WebDriver driver) {
        super(driver);
    }

    public void waitLoaded() {
        wait.until(ExpectedConditions.urlContains("/dashboard"));
        waitVisible(title);
    }

    public String greeting() {
        return text(title);
    }

    public void goToLivres() {
        click(livresLink);
    }

    public void goToUsers() {
        click(usersLink);
    }

    public void goToEmprunts() {
        click(empruntsLink);
    }

    public void logout() {
        click(logoutButton);
    }
}
