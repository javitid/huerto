Feature: File analysis access

  Scenario: Authorized user does not see the file analysis panel while it is temporarily hidden
    Given I am on the dashboard as the authorized file analysis user
    Then I do not see the file analysis panel

  Scenario: Other users do not see the file analysis panel
    Given I am on the dashboard as another user
    Then I do not see the file analysis panel
