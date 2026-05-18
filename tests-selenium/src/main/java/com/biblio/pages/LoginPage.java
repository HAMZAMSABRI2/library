package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    private final By emailInput = By.id("email");
    private final By passwordInput = By.id("password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By alertBox = By.cssSelector("[class*='alert']");
    private final By registerLink = By.linkText("Créer un compte");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/login");
        waitVisible(emailInput);
    }

    public void typeEmail(String email) {
        type(emailInput, email);
    }

    public void typePassword(String password) {
        type(passwordInput, password);
    }

    public void submit() {
        click(submitButton);
    }

    public String errorMessage() {
        return text(alertBox);
    }

    public void goToRegister() {
        click(registerLink);
    }
}
