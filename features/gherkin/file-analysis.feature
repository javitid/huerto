Feature: File analysis access

  Scenario: Authorized user can see the file analysis panel and select a PDF bill
    Given I am on the dashboard as the authorized file analysis user
    Then I see the file analysis panel
    When I select a PDF bill for analysis
    Then I see the selected file in the file analysis panel

  Scenario: Other users do not see the file analysis panel
    Given I am on the dashboard as another user
    Then I do not see the file analysis panel
