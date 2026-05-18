package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LivresFormPage extends BasePage {

    private final By isbnInput = By.name("isbn");
    private final By titreInput = By.name("titre");
    private final By auteurInput = By.name("auteur");
    private final By stockInput = By.name("stock");
    private final By submitButton = By.xpath("//button[@type='submit']");
    private final By cancelButton = By.xpath("//button[contains(., 'Annuler')]");
    private final By backLink = By.xpath("//a[contains(., 'Retour aux livres')]");

    public LivresFormPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/livres/new");
        wait.until(ExpectedConditions.urlContains("/livres/new"));
        waitVisible(isbnInput);
    }

    public void fill(String isbn, String titre, String auteur, String stock) {
        type(isbnInput, isbn);
        type(titreInput, titre);
        type(auteurInput, auteur);
        type(stockInput, stock);
    }

    public void submit() {
        click(submitButton);
    }

    public void cancel() {
        click(cancelButton);
    }

    public boolean isIsbnDisabled() {
        return !waitVisible(isbnInput).isEnabled();
    }

    public boolean isStockInvalid() {
        return !(Boolean) ((org.openqa.selenium.JavascriptExecutor) driver)
                .executeScript("return arguments[0].checkValidity();", waitVisible(stockInput));
    }

    public void clickBack() {
        click(backLink);
    }
}
