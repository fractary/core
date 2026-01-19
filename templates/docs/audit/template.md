# {{title}}

## Executive Summary

{{summary}}

## Scope

{{scope}}

## Methodology

{{methodology}}

## Findings

{{#findings}}
### {{id}}: {{title}}

**Severity:** {{severity}}
**Status:** {{status}}

**Description:**
{{description}}

**Impact:**
{{impact}}

**Recommendation:**
{{recommendation}}

{{/findings}}

## Summary

| Severity | Count |
|----------|-------|
| Critical | {{counts.critical}} |
| High | {{counts.high}} |
| Medium | {{counts.medium}} |
| Low | {{counts.low}} |
| Info | {{counts.info}} |

## Recommendations

{{#recommendations}}
1. {{.}}
{{/recommendations}}

## Appendix

{{appendix}}
