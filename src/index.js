import React, { Component } from 'react'
import { createStackNavigator, createAppContainer, NavigationActions } from 'react-navigation'
import { StatusBar } from 'react-native';
import LoginScreen from './screen/LoginScreen'
import HomeScreen from './screen/HomeScreen'
import SpendingScreen from './screen/SpendingScreen'


const Navigator = createStackNavigator({
    Login: {
        screen: LoginScreen,
    },
    Home: {
        screen: HomeScreen,
    },
    New: {
        screen: SpendingScreen,
    },
}, {
        headerMode: 'screen',
        initialRouteName: 'Login',
    })

class AppRoot extends Component {

    render() {
        const navigation = {
            dispatch: this.props.dispatch,
            state: this.props.nav,
        };
        return (
            <View style={{ flex: 1 }}>
                <Navigator
                    navigation={navigation}
                />
            </View>
        )
    }
}

export default createAppContainer(Navigator);