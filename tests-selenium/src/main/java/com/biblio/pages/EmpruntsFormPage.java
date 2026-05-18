package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class EmpruntsFormPage extends BasePage {

    private final By backLink = By.xpath("//a[contains(., 'Retour aux emprunts')]");
    private final By cancelButton = By.xpath("//button[contains(., 'Annuler')]");

    public EmpruntsFormPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/emprunts/new");
        wait.until(ExpectedConditions.urlContains("/emprunts/new"));
        waitVisible(backLink);
    }

    public void clickBack() {
        click(backLink);
    }

    public void cancel() {
        click(cancelButton);
    }
}
