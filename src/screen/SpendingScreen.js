import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Alert,
    Dimensions
} from "react-native";

import DateTimePicker from 'react-native-modal-datetime-picker';
import { Button, Icon, Input } from "react-native-elements";
import numeral from 'numeral'
import firebase from 'react-native-firebase'
import base64 from 'react-native-base64'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Foundation from 'react-native-vector-icons/Foundation'

const { width, height } = Dimensions.get('window')

class SpendingScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datePicked: this.formatTime(new Date()),
            isDateTimePickerVisible: false,
            date: '',
            moneyFix: '0',
            money: 0,
            onFocus: false,
            notes: ''
        };
        this.databaseRef = firebase.database();
        this.pushData = this.pushData.bind(this);
        this.editData = this.editData.bind(this);
        this.deleteData = this.deleteData.bind(this);
        this.uid = firebase.auth().currentUser.uid;
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        let headerTitle = (params.key == undefined ? 'New Spending' : 'Your Spending')
        let headerTitleStyle = { marginLeft: 10, fontWeight: '400' }
        let headerTintColor = 'black'
        let headerRight = (params.key == undefined ? (
            <Button
                buttonStyle={{
                    backgroundColor: 'transparent',
                    marginRight: 5
                }}
                icon={
                    <Icon
                        name="save"
                        size={27}
                        color="black"
                    />
                }
                onPress={() => params.handleSave()}
            />
        ) : (
                <View style = {{flexDirection: 'row'}}>                   
                    <Button
                        buttonStyle={{
                            backgroundColor: 'transparent',
                            marginRight: 5
                        }}
                        icon={
                            <Foundation
                                name="pencil"
                                size={27}
                                color="black"
                            />
                        }
                        onPress={() => params.handleEdit()}
                    />
                    <Button
                        buttonStyle={{
                            backgroundColor: 'transparent',
                            marginRight: 5
                        }}
                        icon={
                            <MaterialCommunityIcons
                                name="delete"
                                size={27}
                                color="black"
                            />
                        }
                        onPress={() => params.handleDelete()}
                    />
                </View>
            ))
        return { headerTitle, headerTitleStyle, headerTintColor, headerRight };
    };

    pushData() {
        let key = base64.encode(this.state.datePicked);
        const { navigate } = this.props.navigation

        if (this.state.notes == '') return;

        this.databaseRef.ref(this.uid).child(key).push({
            notes: this.state.notes,
            money: this.state.money,
        }, function (error) {
            if (error) {
                Alert.alert("Add new spending", "false");
                return
            } else {
                Alert.alert("Add new spending", "Success");
                navigate('Home');
            }
        });
    }

    editData() {
        const { params = {} } = this.props.navigation.state;
        const { navigate } = this.props.navigation

        this.databaseRef.ref(this.uid).child(params.keyOrigin).child(params.key).set({
            notes: this.state.notes,
            money: this.state.money,
        }, function (error) {
            if (error) {
                Alert.alert("edit your spending", "false");
                return
            } else {
                Alert.alert("edit your spending", "Success");
                navigate('Home');
            }
        });
    }

    deleteData() {
        const { params = {} } = this.props.navigation.state;
        const { navigate } = this.props.navigation

        this.databaseRef.ref(this.uid).child(params.keyOrigin).child(params.key).remove(function (error) {
            if (error) {
                Alert.alert("delete your spending", "false");
                return
            } else {
                Alert.alert("delete your spending", "Success");
                navigate('Home');
            }
        });
    }

    componentDidMount() {
        // We check params receive from home screen when user click on any spending
        const { params = {} } = this.props.navigation.state;
        if(params.key != undefined){
            this.setState({
                datePicked: base64.decode(params.keyOrigin),
                moneyFix: numeral(params.money).format('0,0'),
                money: params.money,
                notes: params.notes,
            })
        }
        this.props.navigation.setParams({ handleSave: this.pushData , handleEdit: this.editData, handleDelete: this.deleteData});
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

    _handleDatePicked = (date) => {
        this.setState({ datePicked: this.formatTime(date), date: date })
        this._hideDateTimePicker();
    };

    formatTime(time) {
        let dayOfWeek = this.dayOfWeekAsInteger(time.getDay()).toString();
        let dayOfMonth = time.getDate().toString();
        let month = (time.getMonth() + 1).toString();
        let year = time.getFullYear().toString();

        return (`${dayOfWeek}, ${dayOfMonth}/${month}/${year}`)
    }

    dayOfWeekAsInteger(day) {
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
    }

    monthOfYearAsInteger(month) {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
    }

    formatMoney(money) {
        let moneyOrigin = numeral(money).value();
        let moneyFix = numeral(money).format('0,0');
        this.setState({ moneyFix: moneyFix, money: moneyOrigin })
    }

    onChangeText(text) {
        this.setState({ notes: text })
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputDirectionContainer}>
                        <FontAwesome
                            name='money'
                            size={30}
                            color='#A4A4A4'
                            style={{ marginLeft: 20 }}
                        />
                        <Input
                            containerStyle={{
                                marginLeft: 10
                            }}
                            value={this.state.moneyFix && this.state.onFocus == true ? (this.state.moneyFix).replace(' ₫', '') : `${this.state.moneyFix} ₫`}
                            placeholder='0'
                            keyboardType='numeric'
                            onChangeText={(text) => this.formatMoney(text)}
                            onFocus={() => this.setState({ onFocus: true })}
                            onBlur={() => this.setState({ onFocus: false })}
                        />
                    </View>
                    <View style={styles.inputDirectionContainer} >
                        <SimpleLineIcons
                            name='note'
                            size={30}
                            color='#A4A4A4'
                            style={{ marginLeft: 20 }}
                        />
                        <Input
                            containerStyle={{
                                marginLeft: 10
                            }}
                            placeholder='Notes'
                            value={this.state.notes}
                            onChangeText={(text) => this.onChangeText(text)}
                            errorStyle={{ color: 'red' }}
                            errorMessage={this.state.notes == '' ? 'You must write the spending reason' : ''}
                        />
                    </View>
                    <TouchableOpacity style={styles.inputDirectionContainer} onPress={() => this._showDateTimePicker()}>
                        <Entypo
                            name='calendar'
                            size={30}
                            color='#A4A4A4'
                            style={{ marginLeft: 20 }}
                        />
                        <Input
                            containerStyle={{
                                marginLeft: 10
                            }}
                            value={this.state.datePicked != '' ? this.state.datePicked : this.formatTime(new Date())}
                            editable={false}
                        />
                        <DateTimePicker
                            isVisible={this.state.isDateTimePickerVisible}
                            onConfirm={this._handleDatePicked}
                            onCancel={this._hideDateTimePicker}
                            mode='date'
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
export default SpendingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6E6E6'
    },
    inputContainer: {
        flexDirection: 'column',
        backgroundColor: 'white',
        marginTop: 20,
    },
    inputDirectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20
    },
});