Feature: Login

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I see the dashboard
