import { test, expect } from '../fixtures/base.fixture';

test.describe('AI Content Generation', () => {
  test('should generate caption and hashtags', async ({ authenticatedPage, aiPage }) => {
    const { page } = authenticatedPage;
    await aiPage.goto();
    
    await aiPage.generateContent(
      'Create a post about our new summer collection',
      'Instagram'
    );
    
    const caption = await aiPage.getCaption();
    const hashtags = await aiPage.getHashtags();
    
    expect(caption).toBeTruthy();
    expect(hashtags).toBeTruthy();
  });
});
