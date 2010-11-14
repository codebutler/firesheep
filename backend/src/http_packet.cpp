//
// http_packet.cpp - C++ wrapper for http header parser.
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
//
// Authors:
//   Eric Butler <eric@codebutler.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

#include "http_packet.hpp"

HttpPacket::HttpPacket(string from, string to)
  : m_from(from), m_to(to), m_complete(false)
{
  memset(&m_settings, 0, sizeof(m_settings));
  m_settings.on_header_field     = header_field_cb_wrapper;
  m_settings.on_header_value     = header_value_cb_wrapper;
  m_settings.on_path             = path_cb_wrapper;
  m_settings.on_query_string     = query_string_cb_wrapper;
  m_settings.on_headers_complete = headers_complete_cb_wrapper;
  m_settings.on_message_complete = message_complete_cb_wrapper;
  
  http_parser_init(&m_parser, HTTP_REQUEST);  
  m_parser.data = this;
}

bool HttpPacket::parse(const char *payload, int payload_size)
{
  if (payload_size > 0) {
    int len = http_parser_execute(&m_parser, &m_settings, payload, payload_size);
    return (m_parser.state != 1 && len == payload_size);
  }
  return false;
}

bool HttpPacket::isComplete()
{
  return m_complete;
}

string HttpPacket::from()
{
  return m_from;
}

string HttpPacket::to()
{
  return m_to;
}

string HttpPacket::host()
{
  return get_header("host");
}

string HttpPacket::method()
{
  return http_method_str((enum http_method) m_parser.method);
}

string HttpPacket::path()
{
  return m_path;
}

string HttpPacket::query()
{
  return m_query;
}

string HttpPacket::user_agent()
{
  return get_header("user-agent");
}

string HttpPacket::cookies()
{
  return get_header("cookie");
}

HeaderMap HttpPacket::headers() 
{
  return m_headers;
}

void HttpPacket::add_header(string name, string value)
{
  HeaderMap::iterator iter;
  iter = m_headers.find(name);
  if (iter == m_headers.end()) {
    m_headers[name] = value;
  } else {
    // FIXME: Technically this is allowed in certain situations, but I doubt 
    // any browsers would do this.
    // http://github.com/ry/node/blob/master/lib/http.js#L219
    cerr << "Ignoring duplicate header: " << name << endl;
    cerr << "  Old: " << m_headers[name] << endl;
    cerr << "  New: " << value << endl;
  }
}

string HttpPacket::get_header(string name)
{ 
  HeaderMap::iterator iter;
  iter = m_headers.find(name);
  if (iter != m_headers.end())
    return iter->second;
  else
    return string();
}

int HttpPacket::path_cb(const char *buf, size_t len)
{
  m_path.append(buf, len);
  return 0;
}

int HttpPacket::query_string_cb(const char *buf, size_t len)
{
  m_query.append(buf, len);
  return 0;
}
  
int HttpPacket::header_field_cb(const char *buf, size_t len)
{
  string str(buf, len);
  boost::to_lower(str);
  
  if (!m_tmp_header_value.empty()) {
    add_header(m_tmp_header_name, m_tmp_header_value);
    m_tmp_header_name.clear();
    m_tmp_header_value.clear();
  }
  
  m_tmp_header_name.append(str);
  
  return 0;
}

int HttpPacket::header_value_cb(const char *buf, size_t len)
{
  m_tmp_header_value.append(buf, len);
  return 0;
}

int HttpPacket::headers_complete_cb()
{ 
  if (!m_tmp_header_value.empty()) {
    add_header(m_tmp_header_name, m_tmp_header_value);
    m_tmp_header_name.clear();
    m_tmp_header_value.clear();
  }
  return 1; // Skip body
}

int HttpPacket::message_complete_cb()
{
  m_complete = true;
  return 0;
}
