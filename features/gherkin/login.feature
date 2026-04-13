Feature: Login

  Scenario: Successful anonymous login
    Given I am on the login page
    When I continue as guest
    Then I see the dashboard

  Scenario: Keyboard navigation allows anonymous login
    Given I am on the login page
    When I continue as guest using the keyboard
    Then I see the dashboard
