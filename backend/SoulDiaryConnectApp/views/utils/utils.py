from .constants import EMOZIONI_EMOJI, CONTESTI_EMOJI

def get_emoji_for_context(contesto):
    """
    Returns the emoji matching the social context.
    If the context isn't in the dictionary, it returns a default emoji.
    """
    if not contesto:
        return '📝'
    
    contesto_lower = contesto.lower().strip()
    return CONTESTI_EMOJI.get(contesto_lower, '📝')

def get_emoji_for_emotion(emozione):
    """
    Returns the emoji corresponding to the emotion.
    If the emotion isn't in the dictionary, it returns a default emoji.
    """
    if not emozione:
        return '💭'
    
    emozione_lower = emozione.lower().strip()
    return EMOZIONI_EMOJI.get(emozione_lower, '💭')