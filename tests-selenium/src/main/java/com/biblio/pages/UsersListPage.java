package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class UsersListPage extends BasePage {

    private final By title = By.tagName("h1");
    private final By searchInput = By.cssSelector("input[placeholder*='Rechercher']");
    private final By rows = By.cssSelector("table tbody tr");
    private final By editButton = By.xpath("//button[contains(., 'Modifier')]");

    public UsersListPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/users");
        wait.until(ExpectedConditions.urlContains("/users"));
        waitVisible(title);
    }

    public int rowCount() {
        return driver.findElements(rows).size();
    }

    public void search(String term) {
        type(searchInput, term);
    }

    public void clickFirstEdit() {
        click(editButton);
    }
}
