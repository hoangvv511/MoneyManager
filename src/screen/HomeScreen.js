import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Alert,
    FlatList,
    TouchableOpacity,
    ToastAndroid,
    BackHandler
} from "react-native";
import { Avatar, Header, Button } from 'react-native-elements'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import firebase from 'react-native-firebase'
import ActionButton from 'react-native-action-button';
import base64 from 'react-native-base64'
import numeral from 'numeral'
import { withNavigationFocus } from 'react-navigation';
import RNExitApp from 'react-native-exit-app'

class HomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            avatar: '',
            name: '',
            data: [],
            allMoney: 0, 
            doubleBackToExitPressedOnce: false,
        };
        this.onBackPress = this.onBackPress.bind(this);
        this.databaseRef = firebase.database();
        this.currentUser = firebase.auth().currentUser;
    }   

    listenForItems(itemRef) {
        this.databaseRef.ref(this.currentUser.uid).on('value', (snap) => {
            // get children as an array
            var items = [];
            var AllMoney = 0;
            snap.forEach((child) => {
                let datas = [];
                let totalMoney = 0;               
                    child.forEach((discription) => {
                        datas.push({
                            keyOrigin: child.key,
                            key: discription.key,
                            notes: discription.val().notes,
                            money: discription.val().money
                        })
                        //calculate money for each day
                        totalMoney += discription.val().money
                    });
                    items.push({
                        key: child.key,
                        data: datas,
                        totalMoney: totalMoney
                    });
                    //calculate money of all day
                    AllMoney += totalMoney;                            
            });
            this.setState({
                data: items,
                allMoney: AllMoney
            });
        });
    }

    static navigationOptions = {
        header: null
    }

    onBackPress() {
        //check if home screen is focus then show toast
        if(this.props.isFocused){
            if (this.state.doubleBackToExitPressedOnce) {
                RNExitApp.exitApp();
            }
            ToastAndroid.show('Click again to exit', ToastAndroid.SHORT);
            this.setState({ doubleBackToExitPressedOnce: true });
            setTimeout(() => {
                this.setState({ doubleBackToExitPressedOnce: false });
            }, 1000);    
            return true;  
        }       
        
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        // Get data from LoginScreen
        if (this.props.navigation.state.params != undefined) {
            var user = this.props.navigation.state.params.user
            this.setState({
                email: user.email,
                avatar: user.photoURL,
                name: user.displayName,
            })
        }
    }

    componentDidMount() {
        //check for update list spending
        this.listenForItems(this.databaseRef);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    } 

    renderLeftComponent() {
        return (
            <View style={{ marginBottom: 20 }}>
                <Avatar
                    size="medium"
                    rounded
                    source={{
                        uri: this.state.avatar
                    }}
                    avatarStyle={styles.avatar}
                />
            </View>
        )
    }

    renderCenterComponent() {
        return (
            <View style={styles.infoUser}>
                <Text style={styles.nameInfo}>{`Hello ${this.state.name}`}</Text>
                <Text style={styles.spendInfo}>{`You spent ${numeral(this.state.allMoney).format('0,0')} ₫`}</Text>
            </View>
        )
    }

    renderRightComponent() {
        return (
            <Button
                buttonStyle={{
                    backgroundColor: 'transparent',
                    marginBottom: 20
                }}
                icon={
                    <MaterialCommunityIcons
                        name="logout"
                        size={27}
                        color="white"
                    />
                }
                onPress={() => Alert.alert(
                    'Log out',
                    'Are you sure want to log out',
                    [{ text: 'OK', onPress: () => this.fbLogout() }, { text: 'Cancel', style: 'cancel' }])}
            />
        )
    }

    _renderItem(item, index) {
        return (
            <View style= {{marginTop: 15, backgroundColor: 'white'}}>
                <View style={styles.totalContainer}>
                    <Text style = {{ color: 'black' , fontSize: 17 , marginLeft: 20}}>{base64.decode(item.key)}</Text>
                    <Text style = {{ color: 'black' , fontSize: 17 , marginRight: 20}}>{`${numeral(item.totalMoney).format('0,0')} ₫`}</Text>
                </View>
                <FlatList
                        data = {item.data}
                        keyExtractor={(item, index) => item.key}
                        renderItem={this._renderItemDiscription.bind(this, item)}
                    />
            </View>                
        )
    }

    _renderItemDiscription(parentData, {item}) {
        return (
            <TouchableOpacity style={styles.discriptionContainer} onPress = {() => this.props.navigation.navigate('New', {
                keyOrigin: item.keyOrigin,
                key: item.key,
                notes: item.notes,
                money: item.money
            })}>
                    <Text style = {{ color: '#929292' , fontSize: 15 , marginLeft: 20}}>{item.notes}</Text>
                    <Text style = {{ color: 'red' , fontSize: 15 , marginRight: 20}}>{`${numeral(item.money).format('0,0')} ₫`}</Text>
            </TouchableOpacity>
        )
    }

    fbLogout() {
        firebase.auth().signOut();
        this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={false} backgroundColor="#298A08" barStyle="light-content" />
                <Header
                    placement="left"
                    leftComponent={this.renderLeftComponent()}
                    centerComponent={this.renderCenterComponent()}
                    rightComponent={this.renderRightComponent()}
                    containerStyle={{
                        backgroundColor: '#31B404',
                        height: 70
                    }}
                />
                <FlatList
                    data = {this.state.data.sort((a, b) => a.key.localeCompare(b.key))}
                    renderItem={({ item }) => this._renderItem(item)}
                />
                <ActionButton
                    style={styles.createButton}
                    buttonColor="#31B404"
                    size={55}
                    position={'center'}
                    onPress={() => this.props.navigation.navigate("New")}
                />
            </View>
        );
    }
}
export default withNavigationFocus(HomeScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6E6'
    },
    infoUser: {
        flexDirection: 'column',
        marginBottom: 20,
    },
    nameInfo: {
        fontSize: 15,
        color: 'white'
    },
    spendInfo: {
        fontSize: 20,
        color: 'white'
    },
    totalContainer: {
        height: 40,
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomColor: '#F2F2F2',
        borderBottomWidth: 1
    },
    discriptionContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        height: 50,
        alignItems: 'center',
    }
});