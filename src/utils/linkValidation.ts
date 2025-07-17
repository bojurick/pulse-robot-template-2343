
interface LinkValidation {
  isValid: boolean;
  reason?: string;
}

export const validateLink = (href: string | undefined, label?: string): LinkValidation => {
  if (!href) {
    return { isValid: false, reason: 'Missing href attribute' };
  }

  if (href === '#' || href === '' || href === 'javascript:void(0)') {
    return { isValid: false, reason: 'Empty or placeholder link' };
  }

  if (href.startsWith('/') && href.length === 1) {
    return { isValid: false, reason: 'Root path without specific route' };
  }

  return { isValid: true };
};

export const auditPageLinks = (): { valid: number; invalid: number; issues: string[] } => {
  const links = document.querySelectorAll('a[href], button[onclick], [role="button"]');
  let valid = 0;
  let invalid = 0;
  const issues: string[] = [];

  links.forEach((link, index) => {
    const href = link.getAttribute('href');
    const onClick = link.getAttribute('onclick');
    const role = link.getAttribute('role');
    const text = link.textContent?.trim() || 'No text';

    if (link.tagName.toLowerCase() === 'a') {
      const validation = validateLink(href, text);
      if (validation.isValid) {
        valid++;
      } else {
        invalid++;
        issues.push(`Link ${index + 1}: "${text}" - ${validation.reason}`);
      }
    } else if (role === 'button' && !onClick && !link.querySelector('input, button')) {
      invalid++;
      issues.push(`Button ${index + 1}: "${text}" - No click handler defined`);
    } else {
      valid++;
    }
  });

  return { valid, invalid, issues };
};

export const preventEmptyLinkNavigation = () => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      const validation = validateLink(link.href);
      if (!validation.isValid) {
        event.preventDefault();
        console.warn('Prevented navigation to invalid link:', validation.reason);
        
        // Show user feedback
        const tooltip = document.createElement('div');
        tooltip.className = 'fixed z-50 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm';
        tooltip.textContent = 'This link is not available yet';
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY - 30}px`;
        
        document.body.appendChild(tooltip);
        setTimeout(() => document.body.removeChild(tooltip), 2000);
      }
    }
  });
};
