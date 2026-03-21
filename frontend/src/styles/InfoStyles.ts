import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const infoStyles = StyleSheet.create({
    avatarContainer: {
        alignSelf: 'center',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.backgroundInput,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 2,
        borderColor: Colors.borderInput,
    },
    infoPrimary: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: 5,
    },
    infoSecondary: {
        fontSize: 14,
        color: Colors.textGray,
        textAlign: 'center',
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textGray,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: Colors.textDark,
        fontWeight: '500',
    },

    // Divider style
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: Colors.borderInput,
    },

    // Contact styles
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: Colors.textGray,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    contactValue: {
        fontSize: 16,
        color: Colors.textDark,
        fontWeight: '500',
    },
});