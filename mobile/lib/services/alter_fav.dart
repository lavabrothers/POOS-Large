import 'dart:convert';
import 'package:http/http.dart' as http;
import '../data/stock_list.dart';

Future<bool> alterFav(String op, String userId, String symbol) async {
  Future<bool> createFavList(String id) async {
    final url = Uri.parse('http://134.122.3.46:3000/api/favorites/create');
    final body = jsonEncode({
      'userId': id,
      'stocks': <Map<String, String>>[]
    });

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      final res = jsonDecode(response.body);
      return res['error'] == null;
    } catch (e) {
      return false;
    }
  }

  String api;
  Map<String, dynamic> body;

  if (op == 'r') {
    api = 'remove';
    body = {
      'userId': userId,
      'symbol': symbol,
    };
  } else if (op == 'a') {
    api = 'add';

    String stockName = '';
    for (final stock in stockList) {
      if (stock['symbol'] == symbol) {
        stockName = stock['name'] ?? '';
        break;
      }
    }

    body = {
      'userId': userId,
      'symbol': symbol,
      'stockName': stockName,
    };
  } else {
    return false; // Invalid op
  }

  try {
    final url = Uri.parse('http://134.122.3.46:3000/api/favorites/$api');
    final response = await http.put(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    final res = jsonDecode(response.body);

    // If favorites list doesn't exist, try to create it once
    if (res['message'] == 'Favorites not found for this user.') {
      if (await createFavList(userId)) {
        return await alterFav(op, userId, symbol); // retry
      } else {
        return false;
      }
    }

    if (res['error'] != null) return false;

    return true;
  } catch (e) {
    return false;
  }
}
