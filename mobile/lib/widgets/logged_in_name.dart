import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoggedInName extends StatefulWidget {
  const LoggedInName({super.key});

  @override
  State<LoggedInName> createState() => _LoggedInNameState();
}

class _LoggedInNameState extends State<LoggedInName> {
  String firstName = '';
  String lastName = '';

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');

    if (userData != null) {
      final user = jsonDecode(userData);
      setState(() {
        firstName = user['firstName'] ?? '';
        lastName = user['lastName'] ?? '';
      });
    }
  }

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');

    // Navigate to login screen
    Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Logged In As $firstName $lastName',
            style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        ElevatedButton(
          onPressed: () => _logout(context),
          child: const Text('Log Out'),
        ),
      ],
    );
  }
}
