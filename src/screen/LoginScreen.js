import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Dimensions, StatusBar, ImageBackground } from 'react-native';
import { AccessToken, LoginButton, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk'
import firebase from 'react-native-firebase'
import { SocialIcon } from 'react-native-elements'
import DropdownAlert from 'react-native-dropdownalert';
import numeral from 'numeral'

const {width, height} = Dimensions.get('window');

export default class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.unsubscriber = null;
    this.state = {
      user: null,
    };
  }

  static navigationOptions = {
    header: null
  }

  componentWillMount(){
    // Check if user already logging
    // Then send some information to HomeScreen
    var user = firebase.auth().currentUser;
    if (user != null) {
      this.props.navigation.navigate("Home", {user})
    }
  }

  componentDidMount() {
    this.unsubscriber = firebase.auth().onAuthStateChanged((changedUser) => {
      //console.log(`changed User : ${JSON.stringify(changedUser.toJSON())}`);
      this.setState({
        user: changedUser
      });
    });
  }

  // componentWillUnmount() {
  //   // Stop listening User logging or Logout
  //   if (this.unsubscriber) {
  //     this.unsubscriber();
  //   }
  // }

  fbLogin() {
    LoginManager
      .logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          return Promise.reject(new Error('The user cancelled the request'));
        }
        // alert(`Login success with permissions: ${result.grantedPermissions.toString()}`);
        this.dropdown.alertWithType('success', 'LoginSuccess', 'Welcome to MoneyManager', 1000);
        // get the access token
        return AccessToken.getCurrentAccessToken();
      })
      .then(data => {
        const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        return firebase.auth().signInWithCredential(credential);
      })
      .then((currentUser) => {  
        setTimeout(() => {
          var user = firebase.auth().currentUser;
          this.props.navigation.navigate("Home", {user})
        },500)     
        //alert(`Facebook Login with user : ${JSON.stringify(currentUser)}`);
      })
      .catch((error) => {
        // alert('Login false');
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden/>
        <DropdownAlert ref={ref => this.dropdown = ref} />
        <ImageBackground
          style = {styles.logo}
          source = {require('../images/logo.png')}
        />
        <SocialIcon
          title='Sign In With Facebook'
          button
          type='facebook'
          style = {styles.loginButton}
          onPress = {() => this.fbLogin()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  loginButton: {
    width: width/2,
    height: 50,
    marginTop: 50
  },
  logo: {
    width: width/2,
    height: height/4 ,
  }
});
