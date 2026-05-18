package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class RegisterPage extends BasePage {

    private final By prenomInput = By.id("prenom");
    private final By nomInput = By.id("nom");
    private final By emailInput = By.id("email");
    private final By passwordInput = By.id("password");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By alertBox = By.cssSelector("[class*='alert']");
    private final By loginLink = By.linkText("Se connecter");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/register");
        waitVisible(prenomInput);
    }

    public void fill(String prenom, String nom, String email, String password) {
        type(prenomInput, prenom);
        type(nomInput, nom);
        type(emailInput, email);
        type(passwordInput, password);
    }

    public void submit() {
        click(submitButton);
    }

    public String errorMessage() {
        return text(alertBox);
    }

    public void goToLogin() {
        click(loginLink);
    }
}
