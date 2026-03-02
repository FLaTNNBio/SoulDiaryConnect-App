import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const commonStyles = StyleSheet.create({
    container_not_log: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors.background,
        padding:16
    },
    safe_container_log:{
        flex: 1,
        width: '100%',
        backgroundColor: Colors.white,
    },
    container_log: {
        flex: 1,
        width: '100%',
        paddingHorizontal:16
    },
    page:{
        flex: 1,
        width: '100%',
        backgroundColor: 'transparent',
        justifyContent: 'center', 
        alignItems: 'center',
    },
    page_left:{
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start', 
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    card: {
        backgroundColor: Colors.white,
        borderWidth:1,
        borderColor:Colors.borderInput,
        borderRadius: 20,
        padding: 24,
        // --- Ombra per iOS ---
        shadowColor: Colors.textGray,
        shadowOffset: { 
            width: 0, 
            height: 6 
        },
        shadowOpacity: 0.08, 
        shadowRadius: 16,
        // --- Ombra per Android ---
        elevation: 3,
    },
    border_card:{
        width: '100%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },

    // --- WELCOME ---
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: 5,
    },
    welcomeSub: {
        fontSize: 14,
        color: Colors.textGray,
        textAlign: 'center',
        marginBottom: 24,
    },

    // --- INPUT ---
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textDark,
        marginBottom: 6,
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundInput,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    inputTextArea: {
        backgroundColor: Colors.backgroundInput,
        borderWidth: 1,
        borderColor: Colors.borderInput,
        borderRadius: 12,
        height:150,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    input: {
        flex: 1,
        height: '100%',
        color: Colors.textDark,
        fontSize: 16,
    },

    // --- TEXT LINK ---
    textBeforeLink:{
        color: Colors.textGray,
        fontSize: 14,
    },
    textLink: {
        color: Colors.primary,
        fontWeight: 'bold',
    },

    // --- ROW ---
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
    }
});