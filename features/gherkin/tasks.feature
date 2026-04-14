Feature: Dashboard task management

  Scenario: Create and complete a task from the dashboard
    Given I am on the login page
    When I continue as guest
    And I create a new dashboard task
    And I mark the created task as done
    Then I see the created task as done in the dashboard

  Scenario: Edit and delete a task from the dashboard
    Given I am on the login page
    When I continue as guest
    And I create a new dashboard task
    And I edit the created task
    And I delete the edited task
    Then I do not see the edited task in the dashboard
