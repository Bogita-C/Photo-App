import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import time
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Test data
TEST_CASES = [
    ("quidem molestiae enim", True),  # Should find results
    ("sunt qui excepturi placeat culpa", True),  # Should find results
    ("xyz123", False),  # Should not find results
]

# Fixtures
@pytest.fixture(scope="session")
def config():
    """Test configuration"""
    return {
        "base_url": "http://localhost:3000",
        "email": "Sincere@april.biz",
        "password": "Test@123"
    }

@pytest.fixture
def driver():
    """Initialize and provide WebDriver"""
    driver = webdriver.Chrome()
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture
def wait(driver):
    """Provide WebDriverWait"""
    return WebDriverWait(driver, 10)

@pytest.fixture
def landing_page(driver, wait, config):
    """Navigate to landing page and click Get Started"""
    driver.get(config["base_url"])

    get_started_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Get Started')]"))
    )
    get_started_button.click()
    logger.info("Clicked Get Started button")

    wait.until(EC.presence_of_element_located((By.ID, "email")))
    logger.info("Successfully navigated to login page")

    yield driver

@pytest.fixture
def logged_in_driver(landing_page, wait, config):
    """Handle login process after landing page"""
    driver = landing_page

    email_field = wait.until(EC.presence_of_element_located((By.ID, "email")))
    password_field = driver.find_element(By.ID, "password")

    email_field.send_keys(config["email"])
    password_field.send_keys(config["password"])

    login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    login_button.click()
    logger.info("Submitted login credentials")

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiGrid-container")))
    wait.until(EC.presence_of_element_located((By.XPATH, "//h6[text()='Albums']")))
    logger.info("Successfully logged in")

    yield driver

@pytest.fixture
def album_page(logged_in_driver, wait):
    """Navigate to albums page"""
    albums_element = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//h6[text()='Albums']/ancestor::div[contains(@class, 'MuiPaper-root')]"))
    )
    albums_element.click()
    logger.info("Clicked Albums card")

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiGrid-container")))
    logger.info("Successfully loaded albums page")

    yield logged_in_driver

class TestLandingPage:
    """Test suite for landing page functionality"""

    def test_landing_page_navigation(self, driver, wait, config):
        """Test navigation from landing page to login"""
        driver.get(config["base_url"])

        get_started_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Get Started')]"))
        )
        get_started_button.click()

        login_form = wait.until(EC.presence_of_element_located((By.ID, "email")))
        assert login_form.is_displayed(), "Should navigate to login page"

class TestLogin:
    """Test suite for login functionality"""

    def test_successful_login(self, landing_page, wait, config):
        """Test successful login with valid credentials"""
        driver = landing_page

        try:
            email_field = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='email']"))
            )
            password_field = driver.find_element(By.CSS_SELECTOR, "input[name='password']")

            email_field.send_keys(config["email"])
            password_field.send_keys(config["password"])
            logger.info("Entered login credentials")

            login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            login_button.click()
            logger.info("Clicked login button")

            grid = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".MuiGrid-container")))
            assert grid.is_displayed(), "Should navigate to home page after login"
            logger.info("Successfully logged in and verified navigation")

        except Exception as e:
            logger.error(f"Login test failed: {str(e)}")
            raise

class TestAlbumSearch:
    """Test suite for album search functionality"""

    @pytest.mark.parametrize("search_term,expect_results", TEST_CASES)
    def test_album_search(self, album_page, wait, search_term, expect_results):
        """Test searching albums with various terms"""
        driver = album_page

        search_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Search albums...']"))
        )
        search_input.clear()
        search_input.send_keys(search_term)
        logger.info(f"Searching for term: {search_term}")

        time.sleep(2)

        albums = driver.find_elements(By.CSS_SELECTOR, ".MuiCard-root")
        results_found = len(albums) > 0

        assert results_found == expect_results, (
            f"Search for '{search_term}' {'found' if results_found else 'did not find'} "
            f"results when it {'should not' if not expect_results else 'should'} have"
        )

        if results_found:
            self._validate_album_results(albums, search_term)
            logger.info(f"Successfully validated {len(albums)} search results")

    def _validate_album_results(self, albums, search_term):
        """Helper method to validate album search results"""
        for index, album in enumerate(albums, 1):
            try:
                title = album.find_element(By.CSS_SELECTOR, ".MuiTypography-h6")
                assert title.is_displayed(), "Album title should be visible"

                icon = album.find_element(By.CSS_SELECTOR, ".MuiSvgIcon-root")
                assert icon.is_displayed(), "Album icon should be visible"

                if search_term.lower() not in title.text.lower():
                    logger.warning(
                        f"Album {index}: '{title.text}' doesn't contain search term '{search_term}'"
                    )

            except NoSuchElementException as e:
                pytest.fail(f"Album {index} element validation failed: {str(e)}")
