# This file is part of ssh2-python.
# Copyright (C) 2017-2020 Panos Kittenis
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation, version 2.1.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

cimport c_ssh2

cdef class Session:
    cdef c_ssh2.LIBSSH2_SESSION *_session
    cdef int _sock
    cdef readonly object sock
    cdef readonly object _kbd_callback


cdef class MethodType:
    cdef int value