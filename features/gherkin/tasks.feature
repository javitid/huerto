Feature: Dashboard task management

  Scenario: Create and complete a task from the dashboard
    Given I am on the login page for task management
    When I access the dashboard task board with e2e permissions
    And I create a new dashboard task
    And I mark the created task as done
    Then I see the created task as done in the dashboard

  Scenario: Edit and delete a task from the dashboard
    Given I am on the login page for task management
    When I access the dashboard task board with e2e permissions
    And I create a new dashboard task
    And I edit the created task
    And I delete the edited task
    Then I do not see the edited task in the dashboard

  Scenario: Filter tasks by a selected status card
    Given I am on the login page for task management
    When I access the dashboard task board with e2e permissions
    And the dashboard has tasks in every status
    And I activate the "Pendiente" task filter
    Then I only see tasks with status "Pendiente" in the dashboard
    And only the "Pendiente" task filter is active
    When I activate the "Hecha" task filter
    Then I only see tasks with status "Hecha" in the dashboard
    And only the "Hecha" task filter is active

  Scenario: Deactivating the selected status card shows all tasks again
    Given I am on the login page for task management
    When I access the dashboard task board with e2e permissions
    And the dashboard has tasks in every status
    And I activate the "En curso" task filter
    And I activate the "En curso" task filter
    Then I see tasks from every status in the dashboard
    And no task filter is active
