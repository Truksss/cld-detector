import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import {icons} from "@/constants/icons";

const _layout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarStyle:{
                borderRadius: 40,
                marginHorizontal:10,
                marginBottom:20,
                height: 50
            }
        }}>
        <Tabs.Screen
            name="index"
            options={{
                title:'Home',
                headerShown:false,
            tabBarIcon: ({ focused }) => (
                <>
                <Image source={icons.home} className="size-5" />
                </>
            )
        }}
        />
        <Tabs.Screen
            name="Leaf"
            options={{
                title:'Leaves',
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                    <>
                    <Image source={icons.leaf} className="size-5" />
                    </>
                )
            }}
        />
        <Tabs.Screen
            name="Disease"
            options={{
                title:'Diseases',
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                    <>
                    <Image source={icons.disease} className="size-5" />
                    </>
                )
            }}
        />
        <Tabs.Screen
            name="AboutUs"
            options={{
                title:'About Us',
                headerShown:false,
                tabBarIcon: ({ focused }) => (
                    <>
                    <Image source={icons.people} className="size-5" />
                    </>
                )
            }}
        />
    </Tabs>

  )
}

export default _layout

const styles = StyleSheet.create({})