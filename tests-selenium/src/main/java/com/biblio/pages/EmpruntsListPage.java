package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;

public class EmpruntsListPage extends BasePage {

    private final By title = By.tagName("h1");
    private final By statutSelect = By.cssSelector("select");
    private final By addButton = By.xpath("//button[contains(., 'Nouvel emprunt')]");
    private final By rows = By.cssSelector("table tbody tr");

    public EmpruntsListPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/emprunts");
        wait.until(ExpectedConditions.urlContains("/emprunts"));
        waitVisible(title);
    }

    public void filterByStatut(String value) {
        Select select = new Select(waitVisible(statutSelect));
        select.selectByValue(value);
    }

    public int rowCount() {
        return driver.findElements(rows).size();
    }

    public void clickAdd() {
        click(addButton);
    }
}
