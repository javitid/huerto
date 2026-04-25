Feature: File analysis access

  Scenario: Authorized user can see the CV analysis panel and select a PDF CV
    Given I am on the dashboard as the authorized file analysis user
    Then I see the file analysis panel
    When I select a PDF CV for analysis
    Then I see the selected file in the CV analysis panel

  Scenario: Other users can also see the CV analysis panel
    Given I am on the dashboard as another user
    Then I see the file analysis panel
