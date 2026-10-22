#!/usr/bin/env python3
"""Build charlescarper.com. Run from the repo root: python3 _build/build.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ccsite
ccsite.main()
