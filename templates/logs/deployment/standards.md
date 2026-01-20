# Deployment Log Standards

## Required Conventions

### 1. Identification
- ALWAYS include unique deployment_id
- ALWAYS specify target environment
- ALWAYS include version and commit SHA

### 2. Status Tracking
- ALWAYS update status as deployment progresses
- ALWAYS record start and end times
- ALWAYS calculate total duration

### 3. Verification
- ALWAYS include verification checklist
- ALWAYS document health check results
- ALWAYS note any manual verification steps

### 4. Rollback Documentation
- ALWAYS document rollback procedure before deployment
- ALWAYS mark status as rolled_back if reverting
- ALWAYS include reason for rollback

## Best Practices

- Use unique deployment_id format: `DEPLOY-{timestamp}-{random}`
- Include pre-deployment checklist completion
- Document any configuration changes
- Link to CI/CD pipeline run
- Record who approved/triggered the deployment
- Keep production deployment logs indefinitely
- Include metrics before and after deployment
- Document any incidents during deployment
