package com.biblio.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LivresListPage extends BasePage {

    private final By title = By.tagName("h1");
    private final By searchInput = By.cssSelector("input[placeholder*='Rechercher']");
    private final By addButton = By.xpath("//button[contains(., 'Ajouter un livre')]");
    private final By rows = By.cssSelector("table tbody tr");
    private final By emptyRow = By.xpath("//*[contains(text(), 'Aucun livre trouvé')]");
    private final By nextButton = By.xpath("//button[contains(., 'Suivant')]");
    private final By editButton = By.xpath("//button[contains(., 'Modifier')]");
    private final By deleteButton = By.xpath("//button[contains(., 'Supprimer')]");

    public LivresListPage(WebDriver driver) {
        super(driver);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/livres");
        wait.until(ExpectedConditions.urlContains("/livres"));
        waitVisible(title);
    }

    public void search(String term) {
        type(searchInput, term);
    }

    public int rowCount() {
        return driver.findElements(rows).size();
    }

    public boolean isEmpty() {
        return !driver.findElements(emptyRow).isEmpty();
    }

    public void clickAdd() {
        click(addButton);
    }

    public void clickNext() {
        click(nextButton);
    }

    public void clickFirstEdit() {
        click(editButton);
    }

    public void clickFirstDelete() {
        click(deleteButton);
    }

    public void dismissConfirm() {
        driver.switchTo().alert().dismiss();
    }
}
