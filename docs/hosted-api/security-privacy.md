# Hosted Security and Privacy

## Shared responsibility

You are responsible for:

- token signing key custody
- secure issuance endpoints
- scanner authentication and transport security

AdmitiQ Hosted is responsible for:

- API key authentication and tenant isolation
- revocation state consistency
- service reliability and secure operations

## Data minimization

Design goal:

- do not ingest token payload `data`
- process/store only project-scoped token identifiers and operational metadata

Recommended stored fields:

- project/environment id
- token digest
- state transitions and timestamps
- usage counters

## Retention

Define and publish:

- default token-state retention window
- log retention
- backup retention
- deletion/export process

## Security controls

- hashed API keys at rest
- TLS in transit
- least-privilege service credentials
- audit logs for admin/security events
- rate limiting and abuse throttling

## Incident handling

- documented severity model
- customer communication SLA
- post-incident RCA with mitigation actions
