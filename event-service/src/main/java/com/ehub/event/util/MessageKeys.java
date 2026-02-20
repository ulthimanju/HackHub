package com.ehub.event.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKeys {
    EVENT_NOT_FOUND("Event not found"),
    UNAUTHORIZED_ORGANIZER("Only the event organizer can perform this action"),
    EVENT_CREATED_SUCCESS("Event created successfully"),
    PROBLEM_ADDED_SUCCESS("Problem statement added successfully"),
    REGISTRATION_SUCCESS("Successfully registered for the event"),
    ALREADY_REGISTERED("You are already registered for this event"),
    REGISTRATION_NOT_FOUND("Registration record not found"),
    REGISTRATION_CANCELLED("Registration cancelled successfully"),
    REGISTRATION_APPROVED("Participant approved successfully"),
    REGISTRATION_REJECTED("Participant rejected successfully"),
    
    TEAM_CREATED("Team created successfully"),
    TEAM_DISMANTLED("Team dismantled successfully"),
    TEAM_LEAVE_SUCCESS("Left the team successfully"),
    TEAM_INVITE_SENT("Invitation sent successfully"),
    TEAM_JOIN_REQUEST_SENT("Join request sent successfully"),
    TEAM_STATUS_UPDATED("Team status updated successfully"),
    TEAM_LEADERSHIP_TRANSFERRED("Leadership transferred successfully"),
    
    TEAM_NOT_FOUND("Team not found"),
    TEAM_MEMBER_NOT_FOUND("Team member not found"),
    ALREADY_IN_TEAM("User is already part of a team in this event"),
    NOT_TEAM_LEADER("Only the team leader can perform this action"),
    // Event management
    EVENT_UPDATED("Event updated successfully"),
    EVENT_DELETED("Event deleted successfully"),
    RESULTS_FINALIZED("Results finalized successfully"),
    PROBLEM_UPDATED("Problem statement updated successfully"),
    PROBLEM_DELETED("Problem statement deleted successfully"),
    PROBLEM_NOT_FOUND("Problem statement not found"),
    UNAUTHORIZED_CREATOR("Unauthorized: Only the event creator can perform this action."),
    // Registration
    UNAUTHORIZED_SELF_REGISTER("Unauthorized: Cannot register on behalf of another user."),
    REGISTRATION_CLOSED("Registration for this event has already closed."),
    EVENT_CAPACITY_REACHED("Event capacity reached. No more participants can be approved."),
    UNAUTHORIZED_CANCEL_REGISTRATION("Unauthorized: Only the participant can cancel their registration."),
    UNAUTHORIZED_MANAGE_REGISTRATIONS("Unauthorized: Only the event creator can manage registrations."),
    // Team lifecycle
    TEAM_EVENT_STARTED("Teams cannot be formed once the event has started."),
    MUST_BE_REGISTERED_TO_CREATE_TEAM("You must be registered for this event to create a team."),
    REGISTRATION_NOT_APPROVED_TEAM("Your registration for this event must be approved before you can create a team."),
    ALREADY_IN_TEAM_THIS_EVENT("You are already an accepted member of another team in this event."),
    USER_ALREADY_ASSOCIATED("User is already a member or has a pending association with this team."),
    UNAUTHORIZED_TEAM_INVITE("Unauthorized: Only the team leader can invite members."),
    USER_NOT_REGISTERED_FOR_INVITE("The user must be registered for this event to be invited."),
    INVITE_REGISTRATION_NOT_APPROVED("The user's registration must be approved before they can be invited."),
    USER_ALREADY_IN_OTHER_TEAM("This user is already an accepted member of another team in this event."),
    TEAM_AT_MAX_CAPACITY("Team has reached its maximum size capacity."),
    ALREADY_REQUESTED_OR_MEMBER("You have already requested to join or are already a member of this team."),
    MUST_BE_REGISTERED_TO_JOIN("You must be registered for this event to join a team."),
    REGISTRATION_NOT_APPROVED_JOIN("Your registration for this event must be approved before you can join a team."),
    TEAM_FULL("This team is already full."),
    MEMBERSHIP_NOT_FOUND("Membership not found"),
    LEADER_NOT_FOUND("Leader not found"),
    MEMBER_NOT_FOUND("Member not found"),
    ONLY_LEADER_CAN_DISMANTLE("Only leader can dismantle team."),
    ONLY_LEADER_CAN_TRANSFER("Only leader can transfer leadership."),
    LEADER_CANNOT_LEAVE("Leader cannot leave. Dismantle or transfer leadership first."),
    ONLY_LEADER_CAN_SELECT_PROBLEM("Only team leader can select problem statement."),
    ONLY_LEADER_CAN_SUBMIT("Only team leader can submit project."),
    PROJECT_SUBMITTED_SUCCESS("Project submitted successfully"),
    SUBMISSIONS_NOT_OPEN("Submissions haven't opened yet. The event starts on %s"),
    SUBMISSIONS_CLOSED("Submissions are closed. The event ended on %s"),
    SUBMISSION_BLOCKED_SCORE_ANNOUNCED("Submissions are locked. Your team's score has already been announced.");

    private final String message;
}