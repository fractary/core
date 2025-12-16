"""
Spec templates for different work types.

Provides built-in templates for common specification types.
"""

from dataclasses import dataclass
from typing import Dict, List

@dataclass
class SpecTemplateSection:
    """A section in a specification template."""
    id: str
    title: str
    required: bool
    description: str
    default_content: str = ""

@dataclass
class SpecTemplate:
    """A specification template."""
    id: str
    name: str
    description: str
    sections: List[SpecTemplateSection]

# Basic template - minimal structure
BASIC_TEMPLATE = SpecTemplate(
    id="basic",
    name="Basic",
    description="Minimal template for simple tasks",
    sections=[
        SpecTemplateSection(
            id="objective",
            title="Objective",
            required=True,
            description="What needs to be accomplished",
            default_content="<!-- Describe the main goal -->",
        ),
        SpecTemplateSection(
            id="requirements",
            title="Requirements",
            required=True,
            description="List of specific requirements",
            default_content="- [ ] Requirement 1\n- [ ] Requirement 2",
        ),
        SpecTemplateSection(
            id="acceptance-criteria",
            title="Acceptance Criteria",
            required=True,
            description="How to verify completion",
            default_content="- [ ] Criterion 1\n- [ ] Criterion 2",
        ),
    ],
)

# Feature template - comprehensive structure
FEATURE_TEMPLATE = SpecTemplate(
    id="feature",
    name="Feature",
    description="Comprehensive template for new features",
    sections=[
        SpecTemplateSection(
            id="overview",
            title="Overview",
            required=True,
            description="High-level description",
            default_content="<!-- Describe the feature -->",
        ),
        SpecTemplateSection(
            id="user-stories",
            title="User Stories",
            required=True,
            description="User stories or use cases",
            default_content="- As a [user], I want [goal] so that [benefit]",
        ),
        SpecTemplateSection(
            id="requirements",
            title="Requirements",
            required=True,
            description="Functional and non-functional requirements",
            default_content="### Functional\n- [ ] Requirement 1\n\n### Non-Functional\n- [ ] Requirement 1",
        ),
        SpecTemplateSection(
            id="technical-design",
            title="Technical Design",
            required=False,
            description="Technical approach",
            default_content="<!-- Describe technical approach -->",
        ),
        SpecTemplateSection(
            id="acceptance-criteria",
            title="Acceptance Criteria",
            required=True,
            description="Verification criteria",
            default_content="- [ ] Criterion 1\n- [ ] Criterion 2",
        ),
        SpecTemplateSection(
            id="testing",
            title="Testing Strategy",
            required=True,
            description="Testing approach",
            default_content="### Unit Tests\n- [ ] Test 1\n\n### Integration Tests\n- [ ] Test 1",
        ),
    ],
)

# Bug template
BUG_TEMPLATE = SpecTemplate(
    id="bug",
    name="Bug Fix",
    description="Template for bug fixes",
    sections=[
        SpecTemplateSection(
            id="description",
            title="Bug Description",
            required=True,
            description="Bug description and impact",
            default_content="<!-- Describe the bug -->",
        ),
        SpecTemplateSection(
            id="reproduction",
            title="Steps to Reproduce",
            required=True,
            description="How to reproduce",
            default_content="1. Step 1\n2. Step 2\n3. Expected: ...\n4. Actual: ...",
        ),
        SpecTemplateSection(
            id="solution",
            title="Proposed Solution",
            required=True,
            description="How to fix",
            default_content="<!-- Describe the fix -->",
        ),
        SpecTemplateSection(
            id="testing",
            title="Testing",
            required=True,
            description="Verification steps",
            default_content="- [ ] Regression test\n- [ ] Edge case tests",
        ),
    ],
)

# All templates
TEMPLATES: Dict[str, SpecTemplate] = {
    "basic": BASIC_TEMPLATE,
    "feature": FEATURE_TEMPLATE,
    "bug": BUG_TEMPLATE,
}

def get_template(template_type: str) -> SpecTemplate:
    """Get a template by type."""
    return TEMPLATES.get(template_type, BASIC_TEMPLATE)

def list_templates() -> List[SpecTemplate]:
    """List all available templates."""
    return list(TEMPLATES.values())

__all__ = [
    "SpecTemplate",
    "SpecTemplateSection",
    "TEMPLATES",
    "get_template",
    "list_templates",
]
