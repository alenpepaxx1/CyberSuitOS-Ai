
export interface AiGenerateOptions {
  contents: any[];
  config?: any;
}

export async function fetchAiGenerate(options: AiGenerateOptions): Promise<any> {
  const response = await fetch('/api/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `AI Generation failed with status: ${response.status}`;
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.error || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response (likely an error page)');
  }

  return response.json();
}
